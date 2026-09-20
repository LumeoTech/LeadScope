package com.crmscanner.scanner.dto;

public record PlaceLeadResponse(
        String placeId,
        String name,
        String category,
        String formattedAddress,
        String formattedPhoneNumber,
        String website,
        Double rating,
        Integer userRatingsTotal,
        String businessStatus,
        Double latitude,
        Double longitude,
        String email
) {
    public PlaceLeadResponse(
            String placeId,
            String name,
            String category,
            String formattedAddress,
            String formattedPhoneNumber,
            String website,
            Double rating,
            Integer userRatingsTotal,
            String businessStatus,
            Double latitude,
            Double longitude
    ) {
        this(placeId, name, category, formattedAddress, formattedPhoneNumber, website, rating, userRatingsTotal, businessStatus, latitude, longitude, null);
    }
}
