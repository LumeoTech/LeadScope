package com.crmscanner.scanner.service;

import com.crmscanner.exception.BusinessException;
import com.crmscanner.scanner.dto.PlaceLeadResponse;
import com.crmscanner.scanner.dto.PlaceSearchRequest;
import com.crmscanner.scanner.dto.PlaceSearchResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
public class GooglePlacesClient {

    private final RestClient googleRestClient;
    private final RestClient osmRestClient;
    private final String apiKey;

    public GooglePlacesClient(@Value("${app.google.places.api-key:}") String apiKey) {
        this.apiKey = apiKey != null ? apiKey.trim() : "";

        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(6));
        factory.setReadTimeout(Duration.ofSeconds(12));

        this.googleRestClient = RestClient.builder()
                .baseUrl("https://maps.googleapis.com/maps/api/place")
                .requestFactory(factory)
                .build();

        this.osmRestClient = RestClient.builder()
                .baseUrl("https://nominatim.openstreetmap.org")
                .defaultHeader("User-Agent", "CRMScannerB2B/1.0 (contact@crmscanner.local)")
                .requestFactory(factory)
                .build();
    }

    public boolean isConfigured() {
        return !apiKey.isBlank();
    }

    public PlaceSearchResponse searchPlaces(PlaceSearchRequest request) {
        boolean forceOsm = "OPENSTREETMAP".equalsIgnoreCase(request.source());

        // Se tem chave do Google e não forçada busca OSM, usa Google Places
        if (isConfigured() && !forceOsm) {
            return searchGooglePlaces(request);
        }

        // Caso contrário, usa OpenStreetMap (100% gratuito, aberto e sem chave)
        log.info("Executando busca de estabelecimentos reais via OpenStreetMap / Nominatim.");
        return searchOpenStreetMap(request);
    }

    @SuppressWarnings("unchecked")
    private PlaceSearchResponse searchGooglePlaces(PlaceSearchRequest request) {
        int radius = request.radius() != null && request.radius() > 0 ? request.radius() : 3000;
        List<PlaceLeadResponse> qualifiedLeads = new ArrayList<>();
        Set<String> seenPlaceIds = new HashSet<>();
        int totalFound = 0;
        int discardedCount = 0;

        for (String category : request.categories()) {
            try {
                Map<String, Object> searchResponse = googleRestClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/textsearch/json")
                                .queryParam("query", category)
                                .queryParam("location", request.latitude() + "," + request.longitude())
                                .queryParam("radius", radius)
                                .queryParam("language", "pt-BR")
                                .queryParam("key", apiKey)
                                .build())
                        .retrieve()
                        .body(Map.class);

                if (searchResponse == null) continue;

                String status = (String) searchResponse.get("status");
                if ("REQUEST_DENIED".equals(status)) {
                    String errorMsg = (String) searchResponse.get("error_message");
                    log.warn("Google Places API erro (REQUEST_DENIED): {}. Alternando para OpenStreetMap...", errorMsg);
                    return searchOpenStreetMap(request);
                }

                if (!"OK".equals(status) && !"ZERO_RESULTS".equals(status)) {
                    continue;
                }

                List<Map<String, Object>> results = (List<Map<String, Object>>) searchResponse.get("results");
                if (results == null || results.isEmpty()) continue;

                for (Map<String, Object> basicPlace : results.stream().limit(10).toList()) {
                    String placeId = (String) basicPlace.get("place_id");
                    if (placeId == null || seenPlaceIds.contains(placeId)) continue;
                    seenPlaceIds.add(placeId);

                    PlaceLeadResponse detailed = fetchPlaceDetails(placeId, category);
                    if (detailed == null) continue;

                    totalFound++;
                    boolean hasPhone = detailed.formattedPhoneNumber() != null && !detailed.formattedPhoneNumber().isBlank();
                    boolean hasWeb = detailed.website() != null && !detailed.website().isBlank();
                    boolean hasEmail = detailed.email() != null && !detailed.email().isBlank();

                    // Regra 6: Todo lead capturado deve ter pelo menos um dos três: e-mail, telefone ou site.
                    // Leads sem nenhum dos três são descartados automaticamente.
                    if (!hasPhone && !hasWeb && !hasEmail) {
                        discardedCount++;
                        continue;
                    }

                    if ("PHONE_ONLY".equalsIgnoreCase(request.captureFilter())) {
                        if (!hasPhone) {
                            discardedCount++;
                            continue;
                        }
                    } else if ("PHONE_AND_WEB".equalsIgnoreCase(request.captureFilter())) {
                        if (!hasPhone || !hasWeb) {
                            discardedCount++;
                            continue;
                        }
                    }

                    qualifiedLeads.add(detailed);
                }

            } catch (Exception e) {
                log.warn("Falha na chamada Google Places: {}. Alternando para OpenStreetMap...", e.getMessage());
                return searchOpenStreetMap(request);
            }
        }

        return new PlaceSearchResponse(qualifiedLeads, totalFound, discardedCount);
    }

    @SuppressWarnings("unchecked")
    private PlaceLeadResponse fetchPlaceDetails(String placeId, String category) {
        try {
            Map<String, Object> detailsResponse = googleRestClient.get()
                    .uri(uriBuilder -> uriBuilder
                            .path("/details/json")
                            .queryParam("place_id", placeId)
                            .queryParam("fields", "place_id,name,formatted_address,formatted_phone_number,international_phone_number,website,rating,user_ratings_total,business_status,geometry")
                            .queryParam("language", "pt-BR")
                            .queryParam("key", apiKey)
                            .build())
                    .retrieve()
                    .body(Map.class);

            if (detailsResponse == null || !"OK".equals(detailsResponse.get("status"))) {
                return null;
            }

            Map<String, Object> result = (Map<String, Object>) detailsResponse.get("result");
            if (result == null) return null;

            String name = (String) result.get("name");
            String formattedAddress = (String) result.get("formatted_address");
            String formattedPhoneNumber = (String) result.get("formatted_phone_number");
            String website = (String) result.get("website");
            String businessStatus = (String) result.get("business_status");

            Double rating = null;
            if (result.get("rating") instanceof Number num) {
                rating = num.doubleValue();
            }

            Integer userRatingsTotal = null;
            if (result.get("user_ratings_total") instanceof Number num) {
                userRatingsTotal = num.intValue();
            }

            Double lat = null;
            Double lng = null;
            if (result.get("geometry") instanceof Map<?, ?> geo && geo.get("location") instanceof Map<?, ?> loc) {
                if (loc.get("lat") instanceof Number nLat) lat = nLat.doubleValue();
                if (loc.get("lng") instanceof Number nLng) lng = nLng.doubleValue();
            }

            // Tenta obter email extraindo da página oficial caso o site esteja presente
            String email = null;
            if (website != null && !website.isBlank()) {
                email = extractEmailFromWebsite(website);
            }

            return new PlaceLeadResponse(
                    placeId,
                    name != null ? name : "Sem nome",
                    category,
                    formattedAddress != null ? formattedAddress : "Endereço não informado",
                    (formattedPhoneNumber != null && !formattedPhoneNumber.isBlank()) ? formattedPhoneNumber : null,
                    (website != null && !website.isBlank()) ? website : null,
                    rating,
                    userRatingsTotal,
                    businessStatus,
                    lat,
                    lng,
                    email
            );

        } catch (Exception e) {
            log.warn("Erro ao buscar detalhes do place_id {}: {}", placeId, e.getMessage());
            return null;
        }
    }

    @SuppressWarnings("unchecked")
    private PlaceSearchResponse searchOpenStreetMap(PlaceSearchRequest request) {
        List<PlaceLeadResponse> list = new ArrayList<>();
        Set<String> seenNames = new HashSet<>();
        int totalFound = 0;
        int discardedCount = 0;

        double radiusMeters = request.radius() != null && request.radius() > 0 ? request.radius() : 3000;
        double delta = radiusMeters / 111000.0;
        double minLng = request.longitude() - delta;
        double maxLng = request.longitude() + delta;
        double minLat = request.latitude() - delta;
        double maxLat = request.latitude() + delta;
        String viewbox = String.format(Locale.US, "%.5f,%.5f,%.5f,%.5f", minLng, maxLat, maxLng, minLat);

        for (String category : request.categories()) {
            try {
                List<Map<String, Object>> osmResults = osmRestClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .path("/search")
                                .queryParam("q", category)
                                .queryParam("viewbox", viewbox)
                                .queryParam("bounded", "1")
                                .queryParam("format", "json")
                                .queryParam("limit", "15")
                                .queryParam("addressdetails", "1")
                                .queryParam("extratags", "1")
                                .build())
                        .retrieve()
                        .body(List.class);

                if (osmResults == null || osmResults.isEmpty()) {
                    osmResults = osmRestClient.get()
                            .uri(uriBuilder -> uriBuilder
                                    .path("/search")
                                    .queryParam("q", category)
                                    .queryParam("format", "json")
                                    .queryParam("limit", "10")
                                    .queryParam("addressdetails", "1")
                                    .queryParam("extratags", "1")
                                    .build())
                            .retrieve()
                            .body(List.class);
                }

                if (osmResults != null) {
                    for (Map<String, Object> item : osmResults) {
                        String name = (String) item.get("name");
                        String displayName = (String) item.get("display_name");
                        if (displayName == null) continue;

                        if (name == null || name.isBlank()) {
                            name = displayName.split(",")[0].trim();
                        }

                        if (seenNames.contains(name.toLowerCase())) continue;
                        seenNames.add(name.toLowerCase());

                        String placeId = "osm-" + item.get("place_id");
                        Double lat = null;
                        Double lng = null;
                        try {
                            if (item.get("lat") != null) lat = Double.parseDouble(String.valueOf(item.get("lat")));
                            if (item.get("lon") != null) lng = Double.parseDouble(String.valueOf(item.get("lon")));
                        } catch (Exception ignored) {}

                        // Extrai telefone, website e email reais do OpenStreetMap quando existirem
                        String phone = null;
                        String website = null;
                        String email = null;
                        if (item.get("extratags") instanceof Map<?, ?> extra) {
                            if (extra.get("phone") instanceof String p && !p.isBlank()) phone = p;
                            else if (extra.get("contact:phone") instanceof String p && !p.isBlank()) phone = p;

                            if (extra.get("website") instanceof String w && !w.isBlank()) website = w;
                            else if (extra.get("contact:website") instanceof String w && !w.isBlank()) website = w;

                            if (extra.get("email") instanceof String em && !em.isBlank()) email = em;
                            else if (extra.get("contact:email") instanceof String em && !em.isBlank()) email = em;
                        }

                        // Se não tem email direto no OSM mas tem website, tenta extrair
                        if (email == null && website != null && !website.isBlank()) {
                            email = extractEmailFromWebsite(website);
                        }

                        totalFound++;
                        boolean hasPhone = phone != null && !phone.isBlank();
                        boolean hasWeb = website != null && !website.isBlank();
                        boolean hasEmail = email != null && !email.isBlank();

                        // Regra 6: Todo lead capturado deve ter pelo menos um dos três: e-mail, telefone ou site.
                        // Leads sem nenhum dos três são descartados automaticamente.
                        if (!hasPhone && !hasWeb && !hasEmail) {
                            discardedCount++;
                            continue;
                        }

                        // Aplica filtro de captura se solicitado
                        if ("PHONE_ONLY".equalsIgnoreCase(request.captureFilter())) {
                            if (!hasPhone) {
                                discardedCount++;
                                continue;
                            }
                        } else if ("PHONE_AND_WEB".equalsIgnoreCase(request.captureFilter())) {
                            if (!hasPhone || !hasWeb) {
                                discardedCount++;
                                continue;
                            }
                        }

                        list.add(new PlaceLeadResponse(
                                placeId,
                                name,
                                category,
                                displayName,
                                phone,
                                website,
                                null,
                                null,
                                "OPERATIONAL",
                                lat,
                                lng,
                                email
                        ));
                    }
                }

            } catch (Exception e) {
                log.warn("Erro ao buscar no OpenStreetMap para categoria '{}': {}", category, e.getMessage());
            }
        }

        return new PlaceSearchResponse(list, totalFound, discardedCount);
    }

    /**
     * Tenta extrair e-mail público de contato da página web com timeout curto para não travar a busca
     */
    private String extractEmailFromWebsite(String websiteUrl) {
        if (websiteUrl == null || websiteUrl.isBlank()) return null;
        try {
            String url = websiteUrl.trim();
            if (!url.startsWith("http://") && !url.startsWith("https://")) {
                url = "https://" + url;
            }

            SimpleClientHttpRequestFactory quickFactory = new SimpleClientHttpRequestFactory();
            quickFactory.setConnectTimeout(Duration.ofMillis(1200));
            quickFactory.setReadTimeout(Duration.ofMillis(1200));
            RestClient quickClient = RestClient.builder().requestFactory(quickFactory).build();

            String html = quickClient.get()
                    .uri(url)
                    .header("User-Agent", "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/115.0.0.0 Safari/537.36")
                    .retrieve()
                    .body(String.class);

            if (html == null) return null;

            // Busca primeiro por links mailto:
            Pattern mailtoPattern = Pattern.compile("mailto:([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,})", Pattern.CASE_INSENSITIVE);
            Matcher mailtoMatcher = mailtoPattern.matcher(html);
            if (mailtoMatcher.find()) {
                String found = mailtoMatcher.group(1).toLowerCase().trim();
                if (!found.contains("wixpress") && !found.contains("sentry") && !found.contains("example") && !found.contains("domain")) {
                    return found;
                }
            }

            // Busca emails comuns de contato
            Pattern contactPattern = Pattern.compile("\\b(contato|comercial|atendimento|vendas|sac|info)@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}\\b", Pattern.CASE_INSENSITIVE);
            Matcher contactMatcher = contactPattern.matcher(html);
            if (contactMatcher.find()) {
                return contactMatcher.group(0).toLowerCase().trim();
            }
        } catch (Exception ignored) {
            // Falha silenciosa de conexão/timeout
        }
        return null;
    }
}
