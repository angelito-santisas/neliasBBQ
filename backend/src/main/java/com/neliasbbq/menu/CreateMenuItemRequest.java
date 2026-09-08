package com.neliasbbq.menu;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;

public record CreateMenuItemRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 80) String category,
    @NotBlank @Size(max = 500) String description,
    @NotNull @DecimalMin("0.00") @DecimalMax("99999999.99") @Digits(integer = 8, fraction = 2) BigDecimal price,
    @NotNull Boolean active,
    @NotNull @Min(0) @Max(1000000) Integer stockAvailable
) {}
