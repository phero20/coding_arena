

export const shouldHide = (pathname: string) => {
    return pathname.startsWith("/problems/") ||
        pathname.startsWith("/arena/match") ||
        pathname.startsWith("/compilers") ||
        pathname.startsWith("/visualizer") ||
        /^\/systemdesign\/workspace\/[^/]+\/diagram\//.test(pathname) ||
        /\/academy\/tracks\/[^/]+\/exercises\/[^/]+/.test(pathname);
}

export const shouldHidefooter = (pathname: string) => {
    return pathname.startsWith("/problems/") ||
        pathname.startsWith("/arena/match") ||
        pathname.startsWith("/compilers") ||
        pathname.startsWith("/systemdesign/learn") ||
        pathname.startsWith("/roadmap") ||
        /^\/systemdesign\/workspace\/[^/]+\/diagram\//.test(pathname) ||
        /^\/systemdesign\/learn\/[^/]+\/diagram\//.test(pathname) ||
        /\/academy\/tracks\/[^/]+\/exercises\/[^/]+/.test(pathname);
}