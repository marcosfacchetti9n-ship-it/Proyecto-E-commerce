package com.portfolio.ecommerce.config;

import com.portfolio.ecommerce.entity.Cart;
import com.portfolio.ecommerce.entity.Category;
import com.portfolio.ecommerce.entity.Product;
import com.portfolio.ecommerce.entity.Role;
import com.portfolio.ecommerce.entity.User;
import com.portfolio.ecommerce.repository.CategoryRepository;
import com.portfolio.ecommerce.repository.ProductRepository;
import com.portfolio.ecommerce.repository.UserRepository;
import java.math.BigDecimal;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;
    private final ProductRepository productRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        seedAdmin();
        seedCatalog();
    }

    private void seedAdmin() {
        if (userRepository.existsByEmail("admin@demo.com")) {
            return;
        }

        User admin = new User();
        admin.setFirstName("Admin");
        admin.setLastName("Portfolio");
        admin.setEmail("admin@demo.com");
        admin.setPassword(passwordEncoder.encode("Admin123"));
        admin.setRoles(Set.of(Role.ADMIN, Role.USER));

        Cart cart = new Cart();
        cart.setUser(admin);
        admin.setCart(cart);

        userRepository.save(admin);
    }

    private void seedCatalog() {
        Category keyboards = getOrCreateCategory("Keyboards", "Teclados mecanicos y perifericos premium para setups modernos.");
        Category audio = getOrCreateCategory("Audio", "Auriculares, parlantes y audio gear para creators y gamers.");
        Category workspace = getOrCreateCategory("Workspace", "Accesorios para escritorios prolijos, productivos y visuales.");
        Category lighting = getOrCreateCategory("Lighting", "Lamparas y luces para mejorar concentracion, ambiente y videollamadas.");
        Category organization = getOrCreateCategory("Organization", "Soportes, docks y accesorios para mantener el escritorio ordenado.");

        // El seed es incremental: si la base ya existe en Neon, agrega solo los productos faltantes.
        createProductIfMissing("Aurora 75", "Teclado mecanico compacto con switches tactiles, RGB sutil y cuerpo de aluminio.", new BigDecimal("189.90"), 12, "https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=900&q=80", keyboards);
        createProductIfMissing("Pulse Studio", "Auriculares over-ear inalambricos con cancelacion de ruido y perfil minimal.", new BigDecimal("249.00"), 20, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", audio);
        createProductIfMissing("Dock Slate", "Base organizadora con soporte vertical, bandeja y acabado mate premium.", new BigDecimal("79.50"), 18, "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80", workspace);
        createProductIfMissing("Mono Lamp", "Lampara de escritorio LED con brazo articulado y temperatura regulable.", new BigDecimal("112.00"), 9, "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=80", lighting);
        createProductIfMissing("Wave One", "Speaker bluetooth compacto con sonido balanceado y diseno para escritorio.", new BigDecimal("134.99"), 14, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=900&q=80", audio);
        createProductIfMissing("Focus Mat XL", "Desk mat amplio con textura suave, base antideslizante y borde reforzado.", new BigDecimal("42.00"), 32, "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=900&q=80", workspace);
        createProductIfMissing("Lift Stand", "Soporte de aluminio para notebook con altura ergonomica y ventilacion abierta.", new BigDecimal("68.90"), 24, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=900&q=80", organization);
        createProductIfMissing("Nova Mic", "Microfono USB cardioide para calls, streaming y grabaciones con sonido claro.", new BigDecimal("119.00"), 16, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=900&q=80", audio);
        createProductIfMissing("Arc Light Bar", "Barra LED para monitor con control tactil y temperatura ajustable.", new BigDecimal("89.99"), 21, "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=900&q=80", lighting);
        createProductIfMissing("Keycap Stone Set", "Set de keycaps PBT de perfil bajo con acabado sobrio para teclados mecanicos.", new BigDecimal("54.00"), 27, "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=900&q=80", keyboards);
        createProductIfMissing("Cable Kit Pro", "Kit de cables trenzados, clips magneticos y sujetadores para ordenar el setup.", new BigDecimal("29.90"), 45, "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=900&q=80", organization);
        createProductIfMissing("Studio Arm", "Brazo articulado reforzado para microfono o camara con ajuste silencioso.", new BigDecimal("74.50"), 13, "https://images.unsplash.com/photo-1520170350707-b2da59970118?auto=format&fit=crop&w=900&q=80", workspace);
    }

    private Category getOrCreateCategory(String name, String description) {
        return categoryRepository.findByNameIgnoreCase(name)
                .orElseGet(() -> createCategory(name, description));
    }

    private Category createCategory(String name, String description) {
        Category category = new Category();
        category.setName(name);
        category.setDescription(description);
        return categoryRepository.save(category);
    }

    private void createProductIfMissing(String name, String description, BigDecimal price, Integer stock, String imageUrl, Category category) {
        boolean productAlreadyExists = productRepository.findAll().stream()
                .anyMatch(product -> product.getName().equalsIgnoreCase(name));
        if (productAlreadyExists) {
            return;
        }

        Product product = new Product();
        product.setName(name);
        product.setDescription(description);
        product.setPrice(price);
        product.setStock(stock);
        product.setImageUrl(imageUrl);
        product.setCategory(category);
        productRepository.save(product);
    }
}
