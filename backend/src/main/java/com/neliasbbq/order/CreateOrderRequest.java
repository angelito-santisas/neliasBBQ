package com.neliasbbq.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;
import java.util.List;

public record CreateOrderRequest(
    @NotEmpty @Size(max = 50) List<@Valid Item> items,
    @Size(max = 300) String specialInstructions
) {
    public record Item(@NotBlank @Size(max = 50) String menuItemId, @Min(1) @Max(99) int quantity) {}
}
