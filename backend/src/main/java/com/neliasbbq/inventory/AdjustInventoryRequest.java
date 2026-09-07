package com.neliasbbq.inventory;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

public record AdjustInventoryRequest(
    @NotNull @DecimalMin(value = "0.01") @DecimalMax("9999999999.99") @Digits(integer = 10, fraction = 2) BigDecimal quantity,
    @NotNull @Pattern(regexp = "RECEIVED|USED|CORRECTION") String movementType,
    @Size(max = 240) String note
) {}
