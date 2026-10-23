# widget-contact

Custom **widget** block. An accessible contact form, rendered locally. It does not load `/widgets/` assets and never calls Shopify.

> **Submissions are not sent anywhere until an `action` endpoint is configured.**
> Without an `action` row the form validates in the browser, shows the success text and discards the input.

## Authoring (Document Authoring)

Model: `standalone`

One block table, one row per field, plus optional config rows:

| widget-contact |                 |
| -------------- | --------------- |
| Name           | text            |
| E-Mail         | email, required |
| Telefonnummer  | tel             |
| Kommentar      | textarea        |
| submit         | Senden          |
| success        | Danke für deine Nachricht. Wir melden uns so schnell wie möglich. |
| action         | https://example.com/contact (optional) |

- **Field rows:** cell 1 is the visible label, cell 2 is the type (`text` \| `email` \| `tel` \| `textarea`) plus an optional `, required`. A missing or unknown type means `text`. The field name comes from the label (`E-Mail` -> `e-mail`, `Telefonnummer` -> `telefonnummer`).
- **Reserved keys:** `submit` (button label), `success` (message after a successful submit), `action` (endpoint URL). These rows configure the form and do not create fields.
- **`action`:** must be an `http(s)://` or root-relative URL; anything else, such as placeholder text, is ignored. When set, the field values are POSTed as JSON (`Content-Type: application/json`) via `fetch`. A 2xx response shows the success text and resets the form. Any other response, or a network error, shows a German error message.
- **Empty block:** falls back to Name, E-Mail (required), Telefonnummer and Kommentar.
- **Layout:** from 750px, `text`/`email` fields sit in a 2-column grid. `tel` and `textarea` span the full width.
- Place it in a section with style `narrow` below the page H1.

## Accessibility

- The form has `aria-label="Kontaktformular"`. Every field has a visible `<label>`.
- Required fields carry `required` and `aria-required` and a visual `*`.
- Validation runs on submit and re-runs on input/blur after that. Inline German messages are linked via `aria-describedby`, invalid fields get `aria-invalid`, and focus moves to the first invalid field. A live status region announces the success, error and summary text.

## Supported variations

No variations.

## Universal Editor fields

N/A (Document Authoring project)

## Open questions

- The source success message appears only after a Shopify submit and was not captured. The default text is a placeholder; confirm it with the client.
