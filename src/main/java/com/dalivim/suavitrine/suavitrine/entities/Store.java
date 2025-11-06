package com.dalivim.suavitrine.suavitrine.entities;

import jakarta.persistence.*;
import lombok.Data;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.dalivim.suavitrine.suavitrine.entities.billing.Billing;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

@Entity
@Data
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    private String name;

    private String description;

    private String slug;

    @OneToOne(cascade = CascadeType.ALL)
    private Address address;

    private String phoneNumber;

    private String email;

    private String cnpj;

    private String instagram;

    private String facebook;

    private String logoUrl;

    private String primaryColor;

    @Enumerated(EnumType.STRING)
    private ThemeMode themeMode;

    private String primaryFont = "Poppins";

    private String secondaryFont = "Inter";

    @Enumerated(EnumType.STRING)
    private RoundedLevel roundedLevel;

    private String productCardShadow;

    private String bannerDesktopUrl;

    private String bannerTabletUrl;

    private String bannerMobileUrl;

    @Enumerated(EnumType.STRING)
    private BackgroundType backgroundType;

    private Boolean backgroundEnabled;

    private Double backgroundOpacity;

    private String backgroundColor;

    @Column(length = 2000)
    private String backgroundConfigJson;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "store")
    private List<StoreUser> storeUsers;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "store")
    private List<StoreEvent> storeEvents;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "store")
    private List<StoreMetrics> storeMetrics;

    @OneToMany(cascade = CascadeType.ALL, fetch = FetchType.LAZY, mappedBy = "store")
    private List<Billing> billings;

    @CreationTimestamp
    private Instant createdAt;

    @UpdateTimestamp
    private Instant updatedAt;

    private Instant deletedAt;

}
