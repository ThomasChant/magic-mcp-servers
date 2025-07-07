import React from "react";
import { Link } from "react-router-dom";
import type { LinkProps } from "react-router-dom";
import { useLocaleRouter } from "./LocaleRouter";

interface LocaleLinkProps extends Omit<LinkProps, "to"> {
    to: string;
    locale?: string;
}

/**
 * LocaleLink component - a Link component that automatically handles locale prefixes
 * It wraps React Router's Link component and adds locale-aware navigation
 */
export const LocaleLink: React.FC<LocaleLinkProps> = ({
    to,
    locale,
    ...props
}) => {
    const { getLocalizedPath } = useLocaleRouter();

    const localizedPath = getLocalizedPath(to, locale as any);

    return <Link {...props} to={localizedPath} />;
};

export default LocaleLink;
