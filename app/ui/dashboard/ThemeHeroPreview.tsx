import { getTheme } from '@/app/ui/themes/registry';
import type { ThemePreviewProps } from '@/app/ui/themes/types';

interface Props extends ThemePreviewProps {
  themeSlug?: string;
}

export default function ThemeHeroPreview({ themeSlug, ...props }: Props) {
  const { Preview } = getTheme(themeSlug);
  return <Preview {...props} />;
}
