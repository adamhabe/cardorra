"use client";

import {
  FormEvent,
  useEffect,
  useRef,
  useState,
} from "react";


type ProductData = {

  id?: string;

  slug?: string;

  name?: string;

  category?: string;

  set_name?: string;

  price?: number;

  old_price?:
    number | null;

  stock?: number;

  badge?:
    string | null;

  image?: string;

  emoji?: string;

  short_description?: string;

  description?: string;

  contents?: unknown;

  active?: boolean;

  featured?: boolean;

  sort_order?: number;

};


type Props = {

  product?:
    ProductData;

  action:
    (
      formData: FormData
    ) =>
      void |
      Promise<void>;

  submitLabel:
    string;

};


const categories = [

  [
    "booster-box",
    "Booster Box",
  ],

  [
    "elite-trainer-box",
    "Elite Trainer Box",
  ],

  [
    "mini-tin",
    "Mini Tin",
  ],

  [
    "booster",
    "Booster",
  ],

  [
    "collection-box",
    "Collection Box",
  ],

  [
    "ostatni",
    "Ostatní",
  ],

];


export default function ProductForm({
  product,
  action,
  submitLabel,
}: Props) {

  const contents =
    Array.isArray(
      product?.contents
    )
      ? product.contents
          .map(String)
          .join("\n")
      : "";


  const fileInputRef =
    useRef<HTMLInputElement>(
      null
    );


  const blobUrlRef =
    useRef<string | null>(
      null
    );


  const [
    previewUrl,
    setPreviewUrl,
  ] =
    useState(
      product?.image ||
      ""
    );


  const [
    selectedFileName,
    setSelectedFileName,
  ] =
    useState("");


  const [
    removeImage,
    setRemoveImage,
  ] =
    useState(false);


  const [
    saving,
    setSaving,
  ] =
    useState(false);


  const [
    submitError,
    setSubmitError,
  ] =
    useState("");



  useEffect(
    () => {

      return () => {

        if (
          blobUrlRef.current
        ) {

          URL.revokeObjectURL(
            blobUrlRef.current
          );

        }

      };

    },
    []
  );



  function handleImageChange(
    event:
      React.ChangeEvent<HTMLInputElement>
  ) {

    const file =
      event.target
        .files?.[0];


    if (!file) {
      return;
    }


    if (
      blobUrlRef.current
    ) {

      URL.revokeObjectURL(
        blobUrlRef.current
      );

    }


    const localUrl =
      URL.createObjectURL(
        file
      );


    blobUrlRef.current =
      localUrl;


    setPreviewUrl(
      localUrl
    );


    setSelectedFileName(
      file.name
    );


    setRemoveImage(
      false
    );


    setSubmitError("");

  }



  function handleRemoveImage() {

    if (
      blobUrlRef.current
    ) {

      URL.revokeObjectURL(
        blobUrlRef.current
      );


      blobUrlRef.current =
        null;

    }


    if (
      fileInputRef.current
    ) {

      fileInputRef.current.value =
        "";

    }


    setPreviewUrl(
      ""
    );


    setSelectedFileName(
      ""
    );


    setRemoveImage(
      true
    );

  }



  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>
  ) {

    event.preventDefault();


    if (saving) {
      return;
    }


    setSaving(true);

    setSubmitError("");


    const form =
      event.currentTarget;


    const formData =
      new FormData(
        form
      );


    const imageFile =
      formData.get(
        "image_file"
      );


    /*
      =========================
      UPLOAD OBRÁZKU
      =========================

      Obrázek jde zvlášť přes API,
      takže neputuje přes Server Action.
    */

    if (
      imageFile instanceof File &&
      imageFile.size > 0
    ) {

      try {

        const uploadData =
          new FormData();


        uploadData.set(
          "file",
          imageFile
        );


        uploadData.set(
          "slug",
          String(
            formData.get(
              "slug"
            ) ||
            formData.get(
              "name"
            ) ||
            "product"
          )
        );


        const response =
          await fetch(
            "/api/admin/product-image",
            {

              method:
                "POST",

              body:
                uploadData,

            }
          );


        const result =
          await response
            .json()
            .catch(
              () => ({})
            );


        if (
          !response.ok
        ) {

          throw new Error(
            typeof result.error ===
              "string"
              ? result.error
              : "Upload obrázku selhal."
          );

        }


        formData.set(
          "uploaded_image_url",
          result.url
        );


        formData.set(
          "uploaded_image_path",
          result.path
        );


        formData.set(
          "remove_image",
          "false"
        );


      } catch (
        error
      ) {

        setSaving(false);


        setSubmitError(
          error instanceof Error
            ? error.message
            : "Upload obrázku selhal."
        );


        return;

      }

    }


    /*
      File už neposíláme do
      samotné Server Action.
    */

    formData.delete(
      "image_file"
    );


    await action(
      formData
    );


    setSaving(false);

  }



  return (
    <>

      {submitError && (

        <div className="productError">
          {submitError}
        </div>

      )}


      <form
        onSubmit={
          handleSubmit
        }
        className="productAdminForm"
      >

        {product?.id && (

          <input
            type="hidden"
            name="id"
            value={
              product.id
            }
          />

        )}


        <input
          type="hidden"
          name="remove_image"
          value={
            removeImage
              ? "true"
              : "false"
          }
        />



        {/* =====================
            01 ZÁKLAD
        ====================== */}

        <section className="productFormSection">

          <div className="productFormSectionHead">

            <span>
              01
            </span>

            <div>

              <h2>
                Základ
              </h2>

              <p>
                Název, URL a zařazení produktu.
              </p>

            </div>

          </div>


          <div className="productFormGrid">

            <label className="productFormFull">

              <span>
                Název produktu
              </span>

              <input
                name="name"
                defaultValue={
                  product?.name ||
                  ""
                }
                placeholder="Destined Rivals Elite Trainer Box"
                required
              />

            </label>


            <label>

              <span>
                Slug
              </span>

              <input
                name="slug"
                defaultValue={
                  product?.slug ||
                  ""
                }
                placeholder="destined-rivals-etb"
              />

              <small>
                Když ho necháš prázdný,
                vytvoří se z názvu.
              </small>

            </label>


            <label>

              <span>
                Kategorie
              </span>

              <select
                name="category"
                defaultValue={
                  product?.category ||
                  "booster"
                }
              >

                {categories.map(
                  (
                    [
                      value,
                      label,
                    ]
                  ) => (

                    <option
                      key={
                        value
                      }
                      value={
                        value
                      }
                    >
                      {label}
                    </option>

                  )
                )}

              </select>

            </label>


            <label className="productFormFull">

              <span>
                Set / edice
              </span>

              <input
                name="set_name"
                defaultValue={
                  product?.set_name ||
                  ""
                }
                placeholder="Scarlet & Violet — Destined Rivals"
              />

            </label>

          </div>

        </section>



        {/* =====================
            02 CENA
        ====================== */}

        <section className="productFormSection">

          <div className="productFormSectionHead">

            <span>
              02
            </span>

            <div>

              <h2>
                Cena a sklad
              </h2>

              <p>
                Hodnoty, které budeš měnit nejčastěji.
              </p>

            </div>

          </div>


          <div className="productFormGrid productFormGridThree">

            <label>

              <span>
                Cena
              </span>

              <div className="productInputSuffix">

                <input
                  name="price"
                  type="number"
                  min="0"
                  defaultValue={
                    product?.price ??
                    0
                  }
                  required
                />

                <b>
                  Kč
                </b>

              </div>

            </label>


            <label>

              <span>
                Původní cena
              </span>

              <div className="productInputSuffix">

                <input
                  name="old_price"
                  type="number"
                  min="0"
                  defaultValue={
                    product?.old_price ??
                    ""
                  }
                />

                <b>
                  Kč
                </b>

              </div>

            </label>


            <label>

              <span>
                Skladem
              </span>

              <div className="productInputSuffix">

                <input
                  name="stock"
                  type="number"
                  min="0"
                  defaultValue={
                    product?.stock ??
                    0
                  }
                  required
                />

                <b>
                  ks
                </b>

              </div>

            </label>

          </div>

        </section>



        {/* =====================
            03 PREZENTACE
        ====================== */}

        <section className="productFormSection">

          <div className="productFormSectionHead">

            <span>
              03
            </span>

            <div>

              <h2>
                Prezentace
              </h2>

              <p>
                Obrázek, badge a texty.
              </p>

            </div>

          </div>


          <div className="productFormGrid">


            {/* IMAGE UPLOAD */}

            <div className="productFormFull productImageManager">


              <div className="productImagePreview">

                {previewUrl ? (

                  <img
                    src={
                      previewUrl
                    }
                    alt="Náhled produktu"
                  />

                ) : (

                  <div className="productImageEmpty">

                    <span>
                      {product?.emoji ||
                        "🎴"}
                    </span>

                    <strong>
                      Bez obrázku
                    </strong>

                  </div>

                )}

              </div>



              <div className="productImageControls">

                <div>

                  <strong>
                    Obrázek produktu
                  </strong>

                  <p>
                    JPG, PNG nebo WebP.
                    Maximum 4 MB.
                  </p>

                </div>


                <input
                  ref={
                    fileInputRef
                  }
                  type="file"
                  name="image_file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={
                    handleImageChange
                  }
                  className="productImageFileInput"
                />


                <div className="productImageButtons">

                  <button
                    type="button"
                    className="productImageSelectButton"
                    onClick={
                      () =>
                        fileInputRef
                          .current
                          ?.click()
                    }
                  >
                    {previewUrl
                      ? "Vybrat nový obrázek"
                      : "Vybrat obrázek"}
                  </button>


                  {previewUrl && (

                    <button
                      type="button"
                      className="productImageRemoveButton"
                      onClick={
                        handleRemoveImage
                      }
                    >
                      Odstranit obrázek
                    </button>

                  )}

                </div>


                {selectedFileName && (

                  <div className="productImageChosen">
                    Vybráno:{" "}
                    <strong>
                      {selectedFileName}
                    </strong>
                  </div>

                )}


                <div className="productImageUploadNote">
                  Obrázek se nahraje při uložení produktu.
                </div>

              </div>

            </div>



            <label>

              <span>
                Badge
              </span>

              <input
                name="badge"
                defaultValue={
                  product?.badge ||
                  ""
                }
                placeholder="NOVINKA"
              />

            </label>


            <label>

              <span>
                Emoji fallback
              </span>

              <input
                name="emoji"
                defaultValue={
                  product?.emoji ||
                  "🎴"
                }
                placeholder="🎴"
              />

            </label>


            <label className="productFormFull">

              <span>
                Krátký popis
              </span>

              <textarea
                name="short_description"
                rows={3}
                defaultValue={
                  product?.short_description ||
                  ""
                }
              />

            </label>


            <label className="productFormFull">

              <span>
                Dlouhý popis
              </span>

              <textarea
                name="description"
                rows={6}
                defaultValue={
                  product?.description ||
                  ""
                }
              />

            </label>


            <label className="productFormFull">

              <span>
                Obsah produktu
              </span>

              <textarea
                name="contents"
                rows={7}
                defaultValue={
                  contents
                }
                placeholder={
                  "36 booster balíčků\nOriginálně zapečetěný display\nAnglická verze"
                }
              />

              <small>
                Jedna položka na jeden řádek.
              </small>

            </label>

          </div>

        </section>



        {/* =====================
            04 NASTAVENÍ
        ====================== */}

        <section className="productFormSection">

          <div className="productFormSectionHead">

            <span>
              04
            </span>

            <div>

              <h2>
                Nastavení
              </h2>

              <p>
                Viditelnost a pořadí.
              </p>

            </div>

          </div>


          <div className="productSwitches">

            <label>

              <input
                type="checkbox"
                name="active"
                defaultChecked={
                  product
                    ? product.active
                    : true
                }
              />

              <div>

                <strong>
                  Aktivní
                </strong>

                <span>
                  Produkt může být zobrazen v shopu.
                </span>

              </div>

            </label>


            <label>

              <input
                type="checkbox"
                name="featured"
                defaultChecked={
                  product?.featured ??
                  false
                }
              />

              <div>

                <strong>
                  Doporučený
                </strong>

                <span>
                  Produkt může být zvýrazněn na homepage.
                </span>

              </div>

            </label>


            <label className="productSortField">

              <div>

                <strong>
                  Pořadí
                </strong>

                <span>
                  Nižší číslo = výš.
                </span>

              </div>

              <input
                name="sort_order"
                type="number"
                min="0"
                defaultValue={
                  product?.sort_order ??
                  0
                }
              />

            </label>

          </div>

        </section>



        <div className="productFormActions">

          <button
            type="submit"
            disabled={
              saving
            }
            className="adminPrimaryButton productSaveButton"
          >
            {saving
              ? "Ukládám..."
              : submitLabel}
          </button>

        </div>

      </form>

    </>
  );
}