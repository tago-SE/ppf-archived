# Live Preview

In PayloadCMS live preview works with postMessage/event listener methods. Admin panel sends JS events to iframe, the protal emdede in iframe listens to events and renders content accordingly.

The JS postMessage/event listener in details is described here - https://developer.mozilla.org/en-US/docs/Web/API/Window/postMessage

PaylodCMS has helper packages which abstracts postMessage/event. More about it here - https://payloadcms.com/docs/live-preview/client

In dotnet portal the custom hook `src/hooks/usePreview.ts`  is created using `@payloadcms/live-preview` package.

## How the preview works in dotnet demo

In `payload.config.ts` there's global `livePreview` config. It generates preview URL for frontend containing the locale, document id, tenant and `?preview` parameter which is used by frontend to enter into preview mode.

When in preview the dotnet portal is initialized as regularly. It loads tenant settings, sitemap and the initial document. If `?preview` is present in URL the  `usePreview` registers necessary event listeners and on document change event it merges with initial data.

### Fix for local development with HMR

When in development mode the HMR forces to re-fetch initial data from CMS and it might not render actual content from admin, because content events are only triggered when you edit the content in Admin UI.

To fix this issue, the `usePreview` hook, when in preview mode, stores merged data in local storage.

### Draft content fetching

When in preview mode and when the fetching document content it adds `draftMode` variable to GraphQL queries. This variable is added and used by our custom GraphQL resolvers. When NOT in preview mode it returns documents with `_status: "published"`, in preview mode it returns documents with any `_status`. Logic of GraphQL resolvers:

```js
const pages = await req.payload.find({
	collection: collection,
	depth: 0,
	req,
	overrideAccess: overrideAccess,
	where: {
		...where,
		tenant: {
			equals: tenantId,
		},
		// ------ DRAFT LOGIC
		...(draftMode ? {} : {
			_status: {
				equals: 'published'
			}
		})
	},
	locale: locale
});
```