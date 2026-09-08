package com.neliasbbq.store;

import com.neliasbbq.common.BadRequestException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StoreService {
    private final JdbcTemplate jdbc;
    public StoreService(JdbcTemplate jdbc) { this.jdbc = jdbc; }

    public record Status(boolean open) {}

    @Transactional(readOnly = true)
    public Status status() {
        return new Status(Boolean.TRUE.equals(jdbc.queryForObject(
            "select is_open from store_settings where id = 1", Boolean.class)));
    }

    @Transactional
    public Status setOpen(boolean open, String staffId) {
        jdbc.update("update store_settings set is_open = ?, updated_at = now(), updated_by = ? where id = 1", open, staffId);
        return new Status(open);
    }

    // Called inside the checkout transaction; serialize closing against order acceptance.
    @Transactional(propagation = org.springframework.transaction.annotation.Propagation.MANDATORY)
    public void requireOpenForOrder() {
        if (!Boolean.TRUE.equals(jdbc.queryForObject(
                "select is_open from store_settings where id = 1 for share", Boolean.class))) {
            throw new BadRequestException("The store is closed. Please order when we reopen.");
        }
    }
}
