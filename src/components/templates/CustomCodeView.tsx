import type { Community } from "@/lib/communities";
import type { MagicEdenListing } from "@/services/magicEden";
import { useEffect } from "react";

type CustomCodeViewProps = {
  community: Community;
  listings?: MagicEdenListing[];
};

export function CustomCodeView({ community, listings = [] }: CustomCodeViewProps) {
  // Automatically animate elements inside the custom HTML
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('story-anim-active');
        }
      });
    }, { threshold: 0.3 });

    setTimeout(() => {
      const elements = document.querySelectorAll('.story-anim-trigger');
      elements.forEach(el => observer.observe(el));
    }, 50);

    return () => observer.disconnect();
  }, [community.themeSettings?.customHtml]);

  let customHtml = community.themeSettings?.customHtml;
  const customCss = community.themeSettings?.customCss;
  const assetDescriptions = community.themeSettings?.assetDescriptions || {};

  if (customHtml) {
    const assetIds = community.themeSettings?.assetIds as string[] | undefined;
    
    if (assetIds && assetIds.length > 0) {
      // If the community has specific ordered assetIds, use them to populate the tags
      assetIds.forEach((id, idx) => {
        const listing = listings.find((l) => l.tokenMint === id);
        if (!listing) return;
        
        const i = idx + 1;
        const desc = assetDescriptions[listing.tokenMint] || "";
        
        customHtml = customHtml!
          .replaceAll(`{{NFT_IMAGE_${i}}}`, listing.image)
          .replaceAll(`{{NFT_NAME_${i}}}`, listing.name)
          .replaceAll(`{{NFT_DESC_${i}}}`, desc);
          
        if (idx === 0) {
          customHtml = customHtml!
            .replaceAll('{{NFT_IMAGE}}', listing.image)
            .replaceAll('{{NFT_NAME}}', listing.name)
            .replaceAll('{{NFT_DESC}}', desc);
        }
      });
    } else if (listings.length > 0) {
      // Fallback: Just iterate the raw listings
      listings.forEach((listing, idx) => {
        const i = idx + 1;
        const desc = assetDescriptions[listing.tokenMint] || "";
        customHtml = customHtml!
          .replaceAll(`{{NFT_IMAGE_${i}}}`, listing.image)
          .replaceAll(`{{NFT_NAME_${i}}}`, listing.name)
          .replaceAll(`{{NFT_DESC_${i}}}`, desc);
      });
    }
    
    // Cleanup any remaining unmatched placeholders to prevent 404s
    for (let i = 1; i <= 10; i++) {
      customHtml = customHtml!
        .replaceAll(`{{NFT_IMAGE_${i}}}`, '')
        .replaceAll(`{{NFT_NAME_${i}}}`, '')
        .replaceAll(`{{NFT_DESC_${i}}}`, '');
    }
    customHtml = customHtml!
      .replaceAll('{{NFT_IMAGE}}', '')
      .replaceAll('{{NFT_NAME}}', '')
      .replaceAll('{{NFT_DESC}}', '');
  }

  return (
    <div className="w-full">
      {/* Inject custom CSS securely scoped to this view */}
      {customCss && (
        <style dangerouslySetInnerHTML={{ __html: customCss }} />
      )}
      
      {/* Inject custom HTML payload */}
      {customHtml ? (
        <div dangerouslySetInnerHTML={{ __html: customHtml }} />
      ) : (
        <div className="flex min-h-[40vh] items-center justify-center rounded-lg border border-dashed border-white/20 bg-white/[0.02]">
          <div className="text-center">
            <h2 className="font-mono text-xl text-white">No Custom HTML Found</h2>
            <p className="mt-2 text-sm text-stone-400">
              Edit this community via the dashboard to inject custom HTML.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
