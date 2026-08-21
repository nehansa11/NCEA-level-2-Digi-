# Aotearoa Support Near Me

High-school project using simple HTML, CSS and JavaScript modules.

## Main categories
The app uses only four service categories:
- Food
- Housing
- Budgeting
- Counselling

The service data is stored in `assets/data/services.json`. Each service has one `Category`; there is no `categories` array.

## Pages
- Home
- Find
- Map
- Learn + 6-question quiz
- Urgent

## Icons
Icons are separate SVG files in `assets/icons/`, so they can be replaced easily without an icon library.

## Run
Use a small local web server because the app loads `services.json` with `fetch()`. For example:

```bash
python3 -m http.server 8000
```

Then open `http://localhost:8000/`.
