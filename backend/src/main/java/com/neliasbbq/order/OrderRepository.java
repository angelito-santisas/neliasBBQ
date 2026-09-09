package com.neliasbbq.order;

import java.util.UUID;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderRepository extends JpaRepository<Order, UUID> {
    @org.springframework.data.jpa.repository.Lock(jakarta.persistence.LockModeType.PESSIMISTIC_WRITE)
    @org.springframework.data.jpa.repository.Query("select o from Order o where o.id = :id")
    java.util.Optional<Order> findByIdForUpdate(@org.springframework.data.repository.query.Param("id") UUID id);
    java.util.List<Order> findTop100ByStatusOrderByCreatedAtAsc(String status);
    @org.springframework.data.jpa.repository.Query(value = "select * from orders where status = 'submitted' and cast(id as text) like concat('%', :number, '%') order by created_at asc limit 100", nativeQuery = true)
    java.util.List<Order> searchPending(@org.springframework.data.repository.query.Param("number") String number);
    @org.springframework.data.jpa.repository.Query(value = "select id from orders where cast(id as text) like concat(:number, '%') order by id limit 2", nativeQuery = true)
    java.util.List<UUID> findIdsByNumber(@org.springframework.data.repository.query.Param("number") String number);
}
