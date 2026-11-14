# MECHWEALTH Trading Academy

Next.js 16, React 19 and TypeScript website. Node.js 22 is required.

## Development

```sh
npm ci
npm run dev
```

## Validation

```sh
npm run lint
npm run test:unit
npm run test:godaddy
npm run build
NEXT_PUBLIC_SITE_URL=https://mechwealth.com npm run test:prerender
```

## Hosting

`npm run build` uses Webpack for compatibility with the verified GoDaddy preview environment. `npm start` runs the production server and uses the platform-assigned PORT. GoDaddy's preview runs the development script.

The tracked `.env.production` contains only the confirmed public website origin, `NEXT_PUBLIC_SITE_URL=https://mechwealth.com`. Never add email, FTP, GitHub or other secrets to it. Existing local secret files and generated output are excluded. Email delivery credentials are not included; production contact notifications remain unconfigured.

The GoDaddy app is `mechwealth` (ID `xya3gs1vuu`), attached to the existing Economy hosting plan in Europe. Publishing and domain cutover require separate verification. The live domain has not been changed by this repository preparation.
