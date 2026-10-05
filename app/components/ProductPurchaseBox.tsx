"use client";

import {
  useState,
} from "react";

import {
  useCart,
} from "./CartProvider";


type PurchaseProduct = {

  slug: string;

  name: string;

  price: number;

  image: string;

  emoji: string;

  stock: number;

};


type ProductPurchaseBoxProps = {

  product:
    PurchaseProduct;

};


export default function ProductPurchaseBox({
  product,
}: ProductPurchaseBoxProps) {

  const {
    addToCart,
  } =
    useCart();


  const [
    quantity,
    setQuantity,
  ] =
    useState(1);


  const [
    added,
    setAdded,
  ] =
    useState(false);


  const isSoldOut =
    product.stock <= 0;


  const maxQuantity =
    Math.min(
      product.stock,
      10
    );


  function handleAddToCart() {

    if (isSoldOut) {
      return;
    }


    addToCart(
      product,
      quantity
    );


    setAdded(true);


    window.setTimeout(
      () => {
        setAdded(false);
      },
      1600
    );

  }


  if (isSoldOut) {

    return (
      <>

        <div className="quantityRow">

          <span>
            Množství
          </span>

          <span>
            0 ks
          </span>

        </div>


        <button
          type="button"
          className="addToCart"
          disabled
          style={{
            opacity: 0.45,
            cursor: "not-allowed",
          }}
        >
          Vyprodáno
        </button>

      </>
    );

  }


  return (
    <>

      <div className="quantityRow">

        <span>
          Množství
        </span>


        <select
          value={quantity}
          onChange={
            (event) =>
              setQuantity(
                Number(
                  event.target.value
                )
              )
          }
        >

          {Array.from(
            {
              length:
                maxQuantity,
            },
            (
              _,
              index
            ) =>
              index + 1
          ).map(
            (number) => (

              <option
                value={number}
                key={number}
              >
                {number}
              </option>

            )
          )}

        </select>

      </div>


      <button
        type="button"
        className={
          added
            ? "addToCart addedToCart"
            : "addToCart"
        }
        onClick={
          handleAddToCart
        }
      >

        {added
          ? "✓ Přidáno do košíku"
          : "Přidat do košíku"}

      </button>

    </>
  );
}