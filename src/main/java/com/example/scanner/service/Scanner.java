package com.example.scanner.service;

import java.net.URI;

/**
 * Common scanner abstraction representing an independent scanning module.
 *
 * @param <T> The result type produced by the scanner.
 */
public interface Scanner<T> {

    /**
     * Executes the scan against the target URI and returns the result.
     *
     * @param uri Target URI validated for safety.
     * @return Scan result of type T.
     */
    T scan(URI uri);
}
