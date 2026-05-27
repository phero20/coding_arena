

export const shouldHide = (pathname: string) => {
    return pathname.startsWith("/problems/") ||
        pathname.startsWith("/arena/match") ||
        pathname.startsWith("/compilers") ||
        /^\/systemdesign-workspace\/[^/]+\/diagram\//.test(pathname) ||
        /\/academy\/tracks\/[^/]+\/exercises\/[^/]+/.test(pathname);
}