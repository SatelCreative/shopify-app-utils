# About

[![Greenkeeper badge](https://badges.greenkeeper.io/SatelCreative/shopify-app-utils.svg)](https://greenkeeper.io/)

Provides functionality for some of the more tedious requirements when building a Shopify app such as consistent hmac validation behavior for authentication, proxies, etc. Provided as general use functions but can easily be adapted for use as express middleware.

This is not meant to be a _batteries included_ solution. For that checkout [`shopify-express`](https://github.com/Shopify/shopify-express)

# Installation

Note: requires NodeJS >= 8.6.0

`npm install @satel/shopify-app-utils`

or

`yarn add @satel/shopify-app-utils`

# Documentation

<!-- Generated by documentation.js. Update this documentation by updating the source code. -->

### Table of Contents

-   [computeHMAC](#computehmac)
    -   [Parameters](#parameters)
    -   [Examples](#examples)
-   [validateAuthHMAC](#validateauthhmac)
    -   [Parameters](#parameters-1)
    -   [Examples](#examples-1)
-   [validateProxyHMAC](#validateproxyhmac)
    -   [Parameters](#parameters-2)
    -   [Examples](#examples-2)
-   [validateShopifyDomain](#validateshopifydomain)
    -   [Parameters](#parameters-3)
    -   [Examples](#examples-3)
-   [validateShopifyTimestamp](#validateshopifytimestamp)
    -   [Parameters](#parameters-4)

## computeHMAC

Produces a hex encoded Sha256 hmac

### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.text` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `options.secret` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### Examples

```javascript
const hash = computeHMAC({
  text: 'message',
  secret: 'hush',
});
```

Returns **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

## validateAuthHMAC

-   **See: <https://help.shopify.com/en/api/getting-started/authentication/oauth#verification>**

Parses the url and validates the HMAC provided by shopify

### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `options.secret` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### Examples

```javascript
// General
const validHMAC = validateAuthHMAC({ url, secret: 'hush' });

// Express
app.use(req => {
  const validHMAC = validateAuthHMAC({ url: req.url, secret: 'hush' });
});
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## validateProxyHMAC

-   **See: <https://help.shopify.com/en/api/guides/application-proxies>**

Parses the url and validates proxied requests from Shopify

### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.url` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
    -   `options.secret` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### Examples

```javascript
// General
const validHMAC = validateProxyHMAC({ url, secret: 'hush' });

// Express
app.use(req => {
  const validHMAC = validateProxyHMAC({ url: req.url, secret: 'hush' });
});
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## validateShopifyDomain

Checks if a string is a valid `.myshopify.com` domain (exclude the protocol)

### Parameters

-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `options.shop` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 

### Examples

```javascript
const validShopifyDomain = validateShopifyDomain({ shop: 'my-shop.myshopify.com' });
```

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 

## validateShopifyTimestamp

Verifies the shopify timestamp generally provided with authenticated responses from shopify

### Parameters

-   `$0` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
    -   `$0.timestamp`  
    -   `$0.margin`   (optional, default `60`)
-   `options` **[Object](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object)** 
-   `timestamp` **[string](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/String)** 
-   `margin` **[number](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Number)** Timestamp must be withing margin of now (optional, default `60`)

Returns **[boolean](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Boolean)** 
