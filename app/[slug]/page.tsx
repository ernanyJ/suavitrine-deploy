import { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Store, BackgroundType } from '../types/store';
import { StoreAccessTracker } from './StoreAccessTracker';
import { CartProvider } from '../contexts/CartContext';
import { StoreSearchWrapper } from './StoreSearchWrapper';
import { CartFooter } from './CartFooter';
import { DotPattern } from '@/components/ui/dot-pattern';
import { StripedPattern } from '@/components/magicui/striped-pattern';
import { GridPattern } from '@/components/ui/grid-pattern';
import { FlickeringGrid } from '@/components/ui/flickering-grid';
import { LightRays } from '@/components/ui/light-rays';
import { getBackendUrl } from '@/lib/api-config';
import { Instagram, Facebook, Mail, Phone, MapPin } from 'lucide-react';

// Helper to get rounded class based on RoundedLevel
function getRoundedClass(level: string): string {
  switch (level) {
    case 'NONE':
      return 'rounded-none';
    case 'SMALL':
      return 'rounded-md';
    case 'MEDIUM':
      return 'rounded-lg';
    case 'LARGE':
      return 'rounded-2xl';
    default:
      return 'rounded-lg';
  }
}

// Helper to format font family name for CSS
function formatFontFamily(fontName: string): string {
  // Add quotes for font names with spaces
  if (fontName.includes(' ')) {
    return `"${fontName}"`;
  }
  return fontName;
}

async function fetchStore(slug: string): Promise<Store> {
  const baseUrl = getBackendUrl();
  console.log(baseUrl);
  if (!baseUrl) {
    throw new Error('Backend URL is not configured');
  }

  const response = await fetch(`${baseUrl}/api/v1/stores/public/${slug}`, {
    cache: 'no-store',
  });

  if (response.status === 404) {
    notFound();
  }

  if (!response.ok) {
    throw new Error('Failed to fetch store data');
  }


  return response.json();
}

// Skeleton Component
function StoreSkeleton() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-black">
      {/* Header Skeleton */}
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 bg-white dark:border-gray-800 dark:bg-black">
        <div className="flex h-16 items-center justify-center px-4">
          <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-800" />
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Banner Skeleton */}
        <div className="mb-12 w-full">
          <div className="aspect-4/1 animate-pulse rounded-lg bg-gray-200 dark:bg-gray-900" />
        </div>

        {/* Categories Skeleton - Slider */}
        <section className="mb-12">
          <div className="mb-6 h-8 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex min-w-[120px] max-w-[120px] flex-col items-center gap-2 sm:min-w-[140px] sm:max-w-[140px]">
                <div className="aspect-square w-full animate-pulse rounded-lg bg-gray-200 dark:bg-gray-900" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              </div>
            ))}
          </div>
        </section>

        {/* Products Skeleton */}
        <section className="space-y-12">
          {Array.from({ length: 2 }).map((_, catIndex) => (
            <div key={catIndex}>
              <div className="mb-6 h-6 w-40 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="overflow-hidden rounded-lg border border-gray-200 bg-white dark:border-gray-900 dark:bg-gray-950"
                  >
                    <div className="aspect-square animate-pulse bg-gray-200 dark:bg-gray-900" />
                    <div className="p-3">
                      <div className="mb-2 h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="mb-2 h-3 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                      <div className="h-3 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>
      </main>

      {/* Footer Skeleton */}
      <footer className="mt-16 border-t border-gray-200 dark:border-gray-900 py-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i}>
                <div className="mb-4 h-5 w-24 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                <div className="space-y-2">
                  <div className="h-4 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                  <div className="h-4 w-28 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

interface StorePageProps {
  params: Promise<{ slug: string }>;
}

// Generate metadata for the store page
export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const store = await fetchStore(slug);

    return {
      title: store.name,
      description: store.description || `Visite ${store.name} e descubra nossos produtos incríveis`,
      openGraph: {
        title: store.name,
        description: store.description || `Visite ${store.name} e descubra nossos produtos incríveis`,
        images: store.logoUrl ? [store.logoUrl] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary',
        title: store.name,
        description: store.description || `Visite ${store.name} e descubra nossos produtos incríveis`,
        images: store.logoUrl ? [store.logoUrl] : [],
      },
      icons: store.logoUrl ? {
        icon: store.logoUrl,
        shortcut: store.logoUrl,
        apple: store.logoUrl,
      } : undefined,
    };
  } catch (error) {
    return {
      title: 'Loja não encontrada',
      description: 'A loja solicitada não foi encontrada.',
    };
  }
}

// Store Content Component
async function StoreContent({ slug }: { slug: string }) {
  const store = await fetchStore(slug);
  console.log(store);

  // Apply theme configuration
  const themeMode = store.themeMode.toLowerCase();
  const primaryColor = store.primaryColor;
  const roundedClass = getRoundedClass(store.roundedLevel);
  const formattedPrimaryFont = formatFontFamily(store.primaryFont);
  const formattedSecondaryFont = formatFontFamily(store.secondaryFont);

  // Helper to convert hex color to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  // Convert shadow color to rgba for box-shadow
  const productCardShadowColor = store.productCardShadow || '#000000';
  const shadowRgb = hexToRgb(productCardShadowColor);
  const productCardShadow = shadowRgb
    ? `0 10px 15px -3px rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, 0.1), 0 4px 6px -4px rgba(${shadowRgb.r}, ${shadowRgb.g}, ${shadowRgb.b}, 0.1)`
    : 'none';

  // Calculate background and text colors based on theme mode
  const bgColor = themeMode === 'dark' ? '#000000' : '#fafafa';
  const textColor = themeMode === 'dark' ? '#fafafa' : '#27272a';
  const borderColor = themeMode === 'dark' ? '#27272a' : '#e4e4e7';

  // Parse background configuration
  let backgroundConfig: Record<string, any> = {};
  if (store.backgroundConfigJson) {
    try {
      backgroundConfig = JSON.parse(store.backgroundConfigJson);
    } catch (e) {
      console.error('Error parsing background config JSON:', e);
    }
  }

  // Helper to render background component
  const renderBackground = () => {
    const backgroundType = store.backgroundType as BackgroundType | undefined;
    const backgroundEnabled = store.backgroundEnabled ?? true;
    const backgroundOpacity = store.backgroundOpacity ?? 0.7;
    const backgroundColor = store.backgroundColor || '#000000';

    // Don't render if no background type or disabled
    if (!backgroundType || backgroundType === 'NONE' || !backgroundEnabled) {
      return null;
    }

    // Convert background color to RGB
    const bgColorRgb = hexToRgb(backgroundColor);
    const backgroundStyle = bgColorRgb
      ? { color: `rgba(${bgColorRgb.r}, ${bgColorRgb.g}, ${bgColorRgb.b}, ${backgroundOpacity})` }
      : { color: backgroundColor, opacity: backgroundOpacity };

    if (backgroundType === 'STRIPED') {
      return (
        <StripedPattern
          direction={backgroundConfig.direction || 'left'}
          width={backgroundConfig.width || 10}
          height={backgroundConfig.height || 10}
          style={backgroundStyle}
        />
      );
    }

    if (backgroundType === 'DOT') {
      return (
        <DotPattern
          width={backgroundConfig.width || 16}
          height={backgroundConfig.height || 16}
          cr={backgroundConfig.cr || 1}
          glow={backgroundConfig.glow || false}
          style={backgroundStyle}
        />
      );
    }

    if (backgroundType === 'GRID') {
      return (
        <GridPattern
          width={backgroundConfig.width || 40}
          height={backgroundConfig.height || 40}
          strokeDasharray={backgroundConfig.strokeDasharray || '0'}
          style={backgroundStyle}
        />
      );
    }

    if (backgroundType === 'FLICKERING_GRID') {
      return (
        <FlickeringGrid
          squareSize={backgroundConfig.squareSize || 4}
          gridGap={backgroundConfig.gridGap || 6}
          flickerChance={backgroundConfig.flickerChance || 0.3}
          color={backgroundColor}
          maxOpacity={backgroundConfig.maxOpacity || 0.3}
          style={{ opacity: backgroundOpacity }}
        />
      );
    }

    if (backgroundType === 'LIGHT_RAYS') {
      return (
        <LightRays
          count={backgroundConfig.count || 7}
          blur={backgroundConfig.blur || 36}
          speed={backgroundConfig.speed || 14}
          length={backgroundConfig.length || '70vh'}
          color={backgroundColor}
          style={{ opacity: backgroundOpacity }}
        />
      );
    }

    return null;
  };


  return (
    <CartProvider>
      {/* Font preconnect for better performance */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Montserrat:wght@400;500;600;700&family=Open+Sans:wght@400;500;600;700&family=Lato:wght@400;500;600;700&family=Nunito:wght@400;500;600;700&family=Source+Sans+Pro:wght@400;500;600;700&family=Playfair+Display:wght@400;500;600;700&family=Merriweather:wght@400;500;600;700&family=Lora:wght@400;500;600;700&family=Oswald:wght@400;500;600;700&family=Raleway:wght@400;500;600;700&family=Work+Sans:wght@400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap"
        rel="stylesheet"
      />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            :root {
              --primary-color: ${primaryColor};
              --primary-font: ${formattedPrimaryFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              --secondary-font: ${formattedSecondaryFont}, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            }
            body {
              font-family: var(--primary-font);
              background-color: ${bgColor} !important;
              color: ${textColor} !important;
            }
            h1, h2, h3, h4, h5, h6 {
              font-family: var(--primary-font);
              font-weight: 600;
            }
            .text-primary {
              color: var(--primary-color) !important;
            }
            .bg-primary {
              background-color: var(--primary-color) !important;
            }
            .border-primary {
              border-color: var(--primary-color) !important;
            }
          `,
        }}
      />
      <div className="relative min-h-screen" style={{ backgroundColor: bgColor, color: textColor }}>
        {/* Dynamic Background Pattern */}
        {store.backgroundType && store.backgroundType !== 'NONE' && store.backgroundEnabled && (
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            {renderBackground()}
          </div>
        )}

        {/* Store Access Tracker - registra métrica de acesso */}
        <div className="relative z-10">
          <StoreAccessTracker storeId={store.id} />
        </div>

        {/* Header com logo no centro, botão de pesquisa e carrinho */}
        <StoreSearchWrapper
          store={store}
          themeMode={themeMode as 'dark' | 'light'}
          roundedClass={roundedClass}
          primaryColor={primaryColor}
          textColor={textColor}
          borderColor={borderColor}
          productCardShadow={productCardShadow}
          logoUrl={store.logoUrl}
          phoneNumber={store.phoneNumber}
        >
          <main className="container mx-auto px-4 py-8 relative z-10">
            {/* Banner */}
            {(store.bannerDesktopUrl || store.bannerTabletUrl || store.bannerMobileUrl) && (
              <div className="mb-12 w-full">
                {/* Desktop Banner (lg+) */}
                {store.bannerDesktopUrl && (
                  <div className="hidden lg:block">
                    <img
                      src={store.bannerDesktopUrl}
                      alt={`Banner ${store.name}`}
                      className={`w-full aspect-4/1 ${roundedClass} object-cover`}
                    />
                  </div>
                )}

                {/* Tablet Banner (md to lg) */}
                {store.bannerTabletUrl && (
                  <div className="hidden md:block lg:hidden">
                    <img
                      src={store.bannerTabletUrl}
                      alt={`Banner ${store.name}`}
                      className={`w-full aspect-4/1 ${roundedClass} object-cover`}
                    />
                  </div>
                )}

                {/* Mobile Banner (below md) */}
                {store.bannerMobileUrl && (
                  <div className="block md:hidden">
                    <img
                      src={store.bannerMobileUrl}
                      alt={`Banner ${store.name}`}
                      className={`w-full aspect-4/1 ${roundedClass} object-cover`}
                    />
                  </div>
                )}
              </div>
            )}
          </main>
        </StoreSearchWrapper>

        {/* Footer */}
        <footer
          className="mt-16 border-t py-8 relative z-10"
          style={{
            borderColor: borderColor,
          }}
        >
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div>
                <h4
                  className="mb-4 font-semibold"
                  style={{ color: textColor }}
                >
                  Sobre
                </h4>
                <p
                  className="text-sm"
                  style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                >
                  {store.name}
                </p>
                {store.description && (
                  <p
                    className="mt-2 text-sm"
                    style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                  >
                    {store.description}
                  </p>
                )}
              </div>
              <div>
                <h4
                  className="mb-4 font-semibold"
                  style={{ color: textColor }}
                >
                  Contato
                </h4>
                {store.email && (
                  <a
                    href={`mailto:${store.email}`}
                    className="flex items-center gap-2 text-sm hover:underline mb-2"
                    style={{ color: primaryColor }}
                  >
                    <Mail 
                      className="w-4 h-4" 
                      style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                    />
                    {store.email}
                  </a>
                )}
                {store.phoneNumber && (
                  <a
                    href={`tel:${store.phoneNumber}`}
                    className="flex items-center gap-2 text-sm hover:underline mb-2"
                    style={{ color: primaryColor }}
                  >
                    <Phone 
                      className="w-4 h-4" 
                      style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                    />
                    {store.phoneNumber}
                  </a>
                )}
                {store.address && (
                  <p
                    className="flex items-start gap-2 text-sm mt-2"
                    style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                  >
                    <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span>
                      {store.address.street}, {store.address.city} - {store.address.state}
                    </span>
                  </p>
                )}
              </div>
              <div>
                <h4
                  className="mb-4 font-semibold"
                  style={{ color: textColor }}
                >
                  Redes Sociais
                </h4>
                {store.instagram && (
                  <a
                    href={`https://instagram.com/${store.instagram}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline mb-2"
                    style={{ color: primaryColor }}
                  >
                    <Instagram 
                      className="w-4 h-4" 
                      style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                    />
                    @{store.instagram}
                  </a>
                )}
                {store.facebook && (
                  <a
                    href={`https://facebook.com/${store.facebook}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm hover:underline"
                    style={{ color: primaryColor }}
                  >
                    <Facebook 
                      className="w-4 h-4" 
                      style={{ color: themeMode === 'dark' ? '#a1a1aa' : '#71717a' }}
                    />
                    {store.facebook}
                  </a>
                )}
              </div>
            </div>
          </div>
        </footer>

        {/* Footer fixo com botão de comprar */}
        <CartFooter
          themeMode={themeMode as 'dark' | 'light'}
          primaryColor={primaryColor}
          textColor={textColor}
          phoneNumber={store.phoneNumber}
        />
      </div>
    </CartProvider>
  );
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;

  return (
    <Suspense fallback={<StoreSkeleton />}>
      <StoreContent slug={slug} />
    </Suspense>
  );
}
