import type { Community } from "@/lib/communities";
import type { MagicEdenListing } from "@/services/magicEden";

type CustomCodeViewProps = {
  community: Community;
  listings?: MagicEdenListing[];
};

export function CustomCodeView({ community, listings = [] }: CustomCodeViewProps) {
  let customHtml = community.themeSettings?.customHtml;
  const customCss = community.themeSettings?.customCss;
  const assetDescriptions = community.themeSettings?.assetDescriptions || {};

  if (customHtml && listings.length > 0) {
    listings.forEach((listing, idx) => {
      const i = idx + 1;
      const desc = assetDescriptions[listing.tokenMint] || "";
      // Use regex with 'g' flag to replace all occurrences
      customHtml = customHtml!
        .replace(new RegExp(`{{NFT_IMAGE_${i}}}`, 'g'), listing.image)
        .replace(new RegExp(`{{NFT_NAME_${i}}}`, 'g'), listing.name)
        .replace(new RegExp(`{{NFT_DESC_${i}}}`, 'g'), desc);
    });
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
