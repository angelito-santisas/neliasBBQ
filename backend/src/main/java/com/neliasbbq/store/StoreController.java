package com.neliasbbq.store;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotNull;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;

@RestController
public class StoreController {
    private final StoreService store;
    public StoreController(StoreService store) { this.store = store; }
    public record UpdateStatus(@NotNull Boolean open) {}

    @GetMapping("/api/v1/store")
    public StoreService.Status status() { return store.status(); }

    @PutMapping("/api/v1/staff/store")
    public StoreService.Status update(@Valid @RequestBody UpdateStatus request, Principal principal) {
        return store.setOpen(request.open(), principal.getName());
    }
}
