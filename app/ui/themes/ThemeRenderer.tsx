import { getTheme } from './registry';
import type { ThemeProps } from './types';

interface ThemeRendererProps extends ThemeProps {
  themeSlug?: string;
}

export default function ThemeRenderer({ themeSlug, ...props }: ThemeRendererProps) {
  const { Page } = getTheme(themeSlug);
  return <Page {...props} />;
}
