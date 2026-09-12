import type { Metadata } from "next";
import { getPublicCatalog } from "@/lib/actions/catalog";
import { formatCurrency } from "@/lib/pricing";
import { buildWhatsAppLink } from "@/lib/whatsapp";

interface CatalogPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: CatalogPageProps): Promise<Metadata> {
  const { slug } = await params;
  const result = await getPublicCatalog(slug);

  if (result.notFound) {
    return { title: "Catálogo no encontrado" };
  }

  return {
    title: result.catalog.business.name,
    description: result.catalog.business.description ?? undefined,
  };
}

export default async function CatalogPage({ params }: CatalogPageProps) {
  const { slug } = await params;
  const result = await getPublicCatalog(slug);

  if (result.notFound) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 p-6 text-center">
        <p className="text-base text-neutral-500">No encontramos este negocio.</p>
      </main>
    );
  }

  const { business, groups } = result.catalog;
  const contactPhone = business.whatsapp || business.phone;

  return (
    <main className="min-h-screen bg-neutral-50 pb-24">
      <header className="border-b border-neutral-100 bg-white px-4 py-6 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-neutral-100 text-neutral-500">
          {business.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo_url}
              alt={business.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xl font-semibold">{business.name.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <h1 className="mt-3 text-xl font-semibold text-neutral-700">{business.name}</h1>
        {business.description && (
          <p className="mt-1 text-sm text-neutral-500">{business.description}</p>
        )}
      </header>

      <div className="mx-auto max-w-2xl px-4 py-6">
        {groups.length === 0 ? (
          <p className="text-center text-sm text-neutral-500">
            Todavía no hay productos cargados.
          </p>
        ) : (
          <div className="flex flex-col gap-8">
            {groups.map((group, index) => (
              <section key={group.category?.id ?? `sin-categoria-${index}`}>
                <h2 className="mb-3 text-base font-semibold text-neutral-700">
                  {group.category?.name ?? "Otros productos"}
                </h2>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {group.products.map((product) => (
                    <div
                      key={product.id}
                      className="flex gap-3 rounded-xl border border-neutral-100 bg-white p-4 shadow-sm"
                    >
                      <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center overflow-hidden rounded-lg bg-neutral-100 text-neutral-500">
                        {product.image_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={product.image_url}
                            alt={product.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <span className="text-xs">Sin foto</span>
                        )}
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col justify-center">
                        <p className="truncate text-sm font-medium text-neutral-700">
                          {product.name}
                        </p>
                        {product.description && (
                          <p className="mt-0.5 line-clamp-2 text-xs text-neutral-500">
                            {product.description}
                          </p>
                        )}
                        <p className="mt-1 text-sm font-semibold text-primary-600">
                          {formatCurrency(product.sale_price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>

      {contactPhone && (
        <a
          href={buildWhatsAppLink(contactPhone)}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 left-1/2 flex h-12 w-[calc(100%-2rem)] max-w-xs -translate-x-1/2 items-center justify-center rounded-full bg-success-600 px-6 text-sm font-medium text-white shadow-lg transition-colors hover:bg-success-700"
        >
          Escribinos por WhatsApp
        </a>
      )}
    </main>
  );
}
