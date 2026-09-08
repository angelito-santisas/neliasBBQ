package com.neliasbbq.menu;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record UpdateMenuItemRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 500) String description,
    @NotNull @DecimalMin("0.00") @DecimalMax("99999999.99") @Digits(integer = 8, fraction = 2) BigDecimal price,
    @NotNull Boolean active,
    @NotNull @Min(0) @Max(1000000) Integer stockAvailable,
    @NotNull @Min(0) Long version,
    @Size(max = 80) @Pattern(regexp = "(?s).*\\S.*") String category
) {
    public UpdateMenuItemRequest(String name, String description, BigDecimal price, Boolean active, Integer stockAvailable, Long version) {
        this(name, description, price, active, stockAvailable, version, null);
    }
}
