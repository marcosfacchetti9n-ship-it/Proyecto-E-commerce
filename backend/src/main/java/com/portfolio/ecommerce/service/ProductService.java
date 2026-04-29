package com.portfolio.ecommerce.service;

import com.portfolio.ecommerce.dto.product.ProductRequest;
import com.portfolio.ecommerce.dto.product.ProductResponse;
import com.portfolio.ecommerce.entity.Category;
import com.portfolio.ecommerce.entity.Product;
import com.portfolio.ecommerce.exception.BadRequestException;
import com.portfolio.ecommerce.exception.NotFoundException;
import com.portfolio.ecommerce.repository.ProductRepository;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
import jakarta.persistence.criteria.Predicate;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final CategoryService categoryService;
    private final MapperService mapperService;

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll(Long categoryId) {
        return findAll(categoryId, null, null, null, null, "featured");
    }

    @Transactional(readOnly = true)
    public List<ProductResponse> findAll(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock,
            String sort
    ) {
        validatePriceRange(minPrice, maxPrice);

        List<Product> products = productRepository.findAll(
                buildCatalogSpecification(categoryId, search, minPrice, maxPrice, inStock),
                resolveSort(sort)
        );
        return products.stream().map(mapperService::toProductResponse).toList();
    }

    @Transactional(readOnly = true)
    public ProductResponse findById(Long id) {
        return mapperService.toProductResponse(getEntity(id));
    }

    public ProductResponse create(ProductRequest request) {
        Product product = new Product();
        applyRequest(product, request);
        return mapperService.toProductResponse(productRepository.save(product));
    }

    public ProductResponse update(Long id, ProductRequest request) {
        Product product = getEntity(id);
        applyRequest(product, request);
        return mapperService.toProductResponse(productRepository.save(product));
    }

    public void delete(Long id) {
        productRepository.delete(getEntity(id));
    }

    public Product getEntity(Long id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Producto no encontrado."));
    }

    private void applyRequest(Product product, ProductRequest request) {
        product.setName(request.name().trim());
        product.setDescription(request.description().trim());
        product.setPrice(request.price());
        product.setStock(request.stock());
        product.setImageUrl(request.imageUrl().trim());
        product.setCategory(categoryService.getEntity(request.categoryId()));
    }

    private Specification<Product> buildCatalogSpecification(
            Long categoryId,
            String search,
            BigDecimal minPrice,
            BigDecimal maxPrice,
            Boolean inStock
    ) {
        return (root, query, criteriaBuilder) -> {
            // La API publica puede filtrar sin exponer reglas de persistencia al frontend.
            root.fetch("category", JoinType.LEFT);
            query.distinct(true);

            Join<Product, Category> category = root.join("category", JoinType.LEFT);
            List<Predicate> predicates = new ArrayList<>();

            if (categoryId != null) {
                predicates.add(criteriaBuilder.equal(category.get("id"), categoryId));
            }

            if (search != null && !search.isBlank()) {
                String pattern = "%" + search.trim().toLowerCase(Locale.ROOT) + "%";
                predicates.add(criteriaBuilder.or(
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("name")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(root.get("description")), pattern),
                        criteriaBuilder.like(criteriaBuilder.lower(category.get("name")), pattern)
                ));
            }

            if (minPrice != null) {
                predicates.add(criteriaBuilder.greaterThanOrEqualTo(root.get("price"), minPrice));
            }

            if (maxPrice != null) {
                predicates.add(criteriaBuilder.lessThanOrEqualTo(root.get("price"), maxPrice));
            }

            if (Boolean.TRUE.equals(inStock)) {
                predicates.add(criteriaBuilder.greaterThan(root.get("stock"), 0));
            }

            return criteriaBuilder.and(predicates.toArray(Predicate[]::new));
        };
    }

    private Sort resolveSort(String sort) {
        return switch (sort == null ? "featured" : sort) {
            case "priceAsc" -> Sort.by("price").ascending().and(Sort.by("id").ascending());
            case "priceDesc" -> Sort.by("price").descending().and(Sort.by("id").ascending());
            case "stockDesc" -> Sort.by("stock").descending().and(Sort.by("id").ascending());
            default -> Sort.by("id").ascending();
        };
    }

    private void validatePriceRange(BigDecimal minPrice, BigDecimal maxPrice) {
        if (minPrice != null && minPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("El precio minimo no puede ser negativo.");
        }

        if (maxPrice != null && maxPrice.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException("El precio maximo no puede ser negativo.");
        }

        if (minPrice != null && maxPrice != null && minPrice.compareTo(maxPrice) > 0) {
            throw new BadRequestException("El precio minimo no puede ser mayor al maximo.");
        }
    }
}
