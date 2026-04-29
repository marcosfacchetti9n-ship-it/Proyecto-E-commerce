package com.portfolio.ecommerce.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.ecommerce.dto.cart.AddCartItemRequest;
import com.portfolio.ecommerce.dto.cart.CartResponse;
import com.portfolio.ecommerce.entity.Cart;
import com.portfolio.ecommerce.entity.CartItem;
import com.portfolio.ecommerce.entity.Product;
import com.portfolio.ecommerce.exception.BadRequestException;
import com.portfolio.ecommerce.repository.CartItemRepository;
import com.portfolio.ecommerce.repository.CartRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class CartServiceTest {

    private static final String USER_EMAIL = "user@test.com";

    @Mock
    private CartRepository cartRepository;

    @Mock
    private CartItemRepository cartItemRepository;

    @Mock
    private ProductService productService;

    @Mock
    private MapperService mapperService;

    @InjectMocks
    private CartService cartService;

    @Test
    void addItemCreatesCartLineWhenStockIsAvailable() {
        Cart cart = emptyCart();
        Product product = productWithStock(7L, 5);

        when(cartRepository.findByUserEmail(USER_EMAIL)).thenReturn(Optional.of(cart));
        when(productService.getEntity(7L)).thenReturn(product);
        when(cartItemRepository.findByCartIdAndProductId(1L, 7L)).thenReturn(Optional.empty());
        when(mapperService.toCartResponse(cart)).thenReturn(new CartResponse(1L, List.of(), BigDecimal.ZERO));

        cartService.addItem(USER_EMAIL, new AddCartItemRequest(7L, 2));

        assertThat(cart.getItems()).hasSize(1);
        assertThat(cart.getItems().get(0).getProduct()).isEqualTo(product);
        assertThat(cart.getItems().get(0).getQuantity()).isEqualTo(2);
        verify(cartRepository).save(cart);
    }

    @Test
    void addItemRejectsQuantitiesAboveAvailableStock() {
        Cart cart = emptyCart();
        Product product = productWithStock(7L, 1);

        when(cartRepository.findByUserEmail(USER_EMAIL)).thenReturn(Optional.of(cart));
        when(productService.getEntity(7L)).thenReturn(product);

        assertThatThrownBy(() -> cartService.addItem(USER_EMAIL, new AddCartItemRequest(7L, 2)))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("stock suficiente");

        verify(cartRepository, never()).save(any(Cart.class));
    }

    private Cart emptyCart() {
        Cart cart = new Cart();
        cart.setId(1L);
        return cart;
    }

    private Product productWithStock(Long id, int stock) {
        Product product = new Product();
        product.setId(id);
        product.setName("Teclado mecanico");
        product.setPrice(BigDecimal.valueOf(120));
        product.setStock(stock);
        return product;
    }
}
