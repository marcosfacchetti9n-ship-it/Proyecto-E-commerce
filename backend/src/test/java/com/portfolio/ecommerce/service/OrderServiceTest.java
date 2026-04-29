package com.portfolio.ecommerce.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import com.portfolio.ecommerce.dto.order.OrderResponse;
import com.portfolio.ecommerce.entity.Cart;
import com.portfolio.ecommerce.entity.CartItem;
import com.portfolio.ecommerce.entity.Order;
import com.portfolio.ecommerce.entity.Product;
import com.portfolio.ecommerce.entity.User;
import com.portfolio.ecommerce.exception.BadRequestException;
import com.portfolio.ecommerce.repository.OrderRepository;
import com.portfolio.ecommerce.repository.ProductRepository;
import com.portfolio.ecommerce.repository.UserRepository;
import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
class OrderServiceTest {

    private static final String USER_EMAIL = "user@test.com";

    @Mock
    private OrderRepository orderRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private CartService cartService;

    @Mock
    private MapperService mapperService;

    @InjectMocks
    private OrderService orderService;

    @Test
    void checkoutCreatesOrderAndDiscountsStock() {
        User user = user();
        Product product = productWithStock(10);
        Cart cart = cartWithItem(product, 3);

        when(userRepository.findWithCartByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(cartService.getCartEntity(USER_EMAIL)).thenReturn(cart);
        when(orderRepository.save(any(Order.class))).thenAnswer(invocation -> invocation.getArgument(0));
        when(mapperService.toOrderResponse(any(Order.class))).thenAnswer(invocation -> {
            Order savedOrder = invocation.getArgument(0);
            return new OrderResponse(savedOrder.getId(), savedOrder.getTotal(), savedOrder.getStatus().name(),
                    savedOrder.getCreatedAt(), List.of());
        });

        OrderResponse response = orderService.checkout(USER_EMAIL);

        ArgumentCaptor<Order> orderCaptor = ArgumentCaptor.forClass(Order.class);
        verify(orderRepository).save(orderCaptor.capture());

        Order savedOrder = orderCaptor.getValue();
        assertThat(savedOrder.getItems()).hasSize(1);
        assertThat(savedOrder.getTotal()).isEqualByComparingTo("360.00");
        assertThat(response.total()).isEqualByComparingTo("360.00");
        assertThat(product.getStock()).isEqualTo(7);
        assertThat(cart.getItems()).isEmpty();
        verify(productRepository).saveAll(List.of(product));
    }

    @Test
    void checkoutRejectsEmptyCart() {
        User user = user();
        Cart cart = new Cart();

        when(userRepository.findWithCartByEmail(USER_EMAIL)).thenReturn(Optional.of(user));
        when(cartService.getCartEntity(USER_EMAIL)).thenReturn(cart);

        assertThatThrownBy(() -> orderService.checkout(USER_EMAIL))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("vacio");

        verify(orderRepository, never()).save(any(Order.class));
    }

    private User user() {
        User user = new User();
        user.setEmail(USER_EMAIL);
        user.setFirstName("Demo");
        user.setLastName("User");
        return user;
    }

    private Product productWithStock(int stock) {
        Product product = new Product();
        product.setId(5L);
        product.setName("Monitor 27");
        product.setPrice(BigDecimal.valueOf(120));
        product.setStock(stock);
        return product;
    }

    private Cart cartWithItem(Product product, int quantity) {
        Cart cart = new Cart();
        CartItem item = new CartItem();
        item.setCart(cart);
        item.setProduct(product);
        item.setQuantity(quantity);
        cart.getItems().add(item);
        return cart;
    }
}
