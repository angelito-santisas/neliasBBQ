package com.neliasbbq.inventory;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record CreateInventoryItemRequest(
    @NotBlank @Size(max = 120) String name,
    @NotBlank @Size(max = 40) String sku,
    @NotBlank @Size(max = 80) String category,
    @NotBlank @Size(max = 30) String unit,
    @NotNull @DecimalMin("0.00") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal quantity,
    @NotNull @DecimalMin("0.00") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal reorderLevel,
    @NotNull @DecimalMin("0.00") @DecimalMax("99999999.99") @Digits(integer = 8, fraction = 2) BigDecimal unitCost
) {}
