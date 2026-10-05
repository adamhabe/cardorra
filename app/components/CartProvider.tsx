"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: number;
  image: string;
  emoji: string;
  quantity: number;
  stock: number;
};

type CartContextType = {
  items: CartItem[];

  addToCart: (
    product: Omit<CartItem, "quantity">,
    quantity: number
  ) => void;

  removeFromCart: (
    slug: string
  ) => void;

  updateQuantity: (
    slug: string,
    quantity: number
  ) => void;

  clearCart: () => void;

  totalItems: number;
  totalPrice: number;

  cartLoaded: boolean;
};

const CartContext =
  createContext<CartContextType | null>(
    null
  );

export function CartProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [items, setItems] =
    useState<CartItem[]>([]);

  const [cartLoaded, setCartLoaded] =
    useState(false);


  /*
    NEJDŘÍV NAČTEME KOŠÍK
    Z LOCALSTORAGE
  */

  useEffect(() => {
    try {
      const savedCart =
        localStorage.getItem(
          "tcg-cart"
        );

      if (savedCart) {
        const parsedCart =
          JSON.parse(savedCart);

        if (
          Array.isArray(
            parsedCart
          )
        ) {
          setItems(
            parsedCart
          );
        }
      }
    } catch (
      error
    ) {
      console.error(
        "Nepodařilo se načíst košík:",
        error
      );
    }

    setCartLoaded(true);

  }, []);


  /*
    AŽ POTOM UKLÁDÁME
    ZMĚNY KOŠÍKU
  */

  useEffect(() => {

    if (
      !cartLoaded
    ) {
      return;
    }

    try {
      localStorage.setItem(
        "tcg-cart",
        JSON.stringify(
          items
        )
      );
    } catch (
      error
    ) {
      console.error(
        "Nepodařilo se uložit košík:",
        error
      );
    }

  }, [
    items,
    cartLoaded,
  ]);


  function addToCart(
    product: Omit<
      CartItem,
      "quantity"
    >,
    quantity: number
  ) {

    setItems(
      (current) => {

        const existing =
          current.find(
            (item) =>
              item.slug ===
              product.slug
          );


        if (existing) {

          return current.map(
            (item) => {

              if (
                item.slug !==
                product.slug
              ) {
                return item;
              }


              return {
                ...item,

                quantity:
                  Math.min(
                    item.quantity +
                    quantity,

                    product.stock
                  ),
              };

            }
          );

        }


        return [
          ...current,

          {
            ...product,
            quantity:
              Math.min(
                quantity,
                product.stock
              ),
          },
        ];

      }
    );

  }


  function removeFromCart(
    slug: string
  ) {

    setItems(
      (current) =>
        current.filter(
          (item) =>
            item.slug !==
            slug
        )
    );

  }


  function updateQuantity(
    slug: string,
    quantity: number
  ) {

    setItems(
      (current) =>
        current.map(
          (item) => {

            if (
              item.slug !==
              slug
            ) {
              return item;
            }


            return {
              ...item,

              quantity:
                Math.max(
                  1,

                  Math.min(
                    quantity,
                    item.stock
                  )
                ),
            };

          }
        )
    );

  }


  function clearCart() {
    setItems([]);
  }


  const totalItems =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.quantity,

      0
    );


  const totalPrice =
    items.reduce(
      (
        total,
        item
      ) =>
        total +
        item.price *
        item.quantity,

      0
    );


  return (

    <CartContext.Provider
      value={{
        items,

        addToCart,

        removeFromCart,

        updateQuantity,

        clearCart,

        totalItems,

        totalPrice,

        cartLoaded,
      }}
    >

      {children}

    </CartContext.Provider>

  );

}


export function useCart() {

  const context =
    useContext(
      CartContext
    );


  if (
    !context
  ) {

    throw new Error(
      "useCart musí být uvnitř CartProvider"
    );

  }


  return context;

}