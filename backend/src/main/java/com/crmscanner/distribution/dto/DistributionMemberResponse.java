package com.crmscanner.distribution.dto;

import com.crmscanner.distribution.entity.DistributionRuleMember;

public record DistributionMemberResponse(
    Long id,
    Long userId,
    String userName,
    String userEmail,
    Integer weight,
    Boolean active
) {
    public static DistributionMemberResponse fromEntity(DistributionRuleMember m) {
        return new DistributionMemberResponse(
            m.getId(),
            m.getUser().getId(),
            m.getUser().getName(),
            m.getUser().getEmail(),
            m.getWeight(),
            m.getActive()
        );
    }
}
