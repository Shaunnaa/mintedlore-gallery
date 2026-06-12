import type { Community } from "@/lib/communities";

type CustomCodeViewProps = {
  community: Community;
};

export function CustomCodeView({ community }: CustomCodeViewProps) {
  const customHtml = community.themeSettings?.customHtml;
  const customCss = community.themeSettings?.customCss;

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
