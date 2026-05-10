const apiTheme = "http://localhost:1337/api/site-setting";

async function applyThemeFromAPI() {
    try {
        const res = await axios.get(apiTheme);

        const theme =
            res.data?.data?.theme ||
            res.data?.data?.attributes?.theme ||
            "light";

        document.body.classList.remove("light", "dark", "colorBlind");

        if (theme === "dark") {
            document.body.classList.add("dark");
        } else if (theme === "colorBlind") {
            document.body.classList.add("colorBlind");
        } else {
            document.body.classList.add("light");
        }

    } catch (err) {
        console.error("Theme load failed:", err);
        document.body.classList.add("light");
    }
}

applyThemeFromAPI();