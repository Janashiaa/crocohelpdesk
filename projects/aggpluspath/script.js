
let token;
let URLCMS = "https://internal-cms-back.crocobet.com/api/internal/campaigns/"

function getData() {
    fetch("https://internal-cms-back.crocobet.com/api/internal/campaigns?page=0&size=100&sort=%5B%22id%22,-1%5D&filter=%7B%22status%22:%22active%22,%22type%22:%22aggregator%22%7D&fields=%5B%22id%22,%22uid%22,%22type%22,%22name%22,%22enabled%22,%22startDate%22,%22endDate%22,%22releaseStage%22,%22version%22,%22downForMaintenance%22%5D&relations=%5B%5D&search=null", {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            analyzeData(data)
        })
        .catch(error => {
            console.error("Error fetching campaigns:", error);
        });
}

function analyzeData(response) {
    console.log("📊 Campaigns data:", response);

    const baseUrl = URLCMS;
    const bearerToken = token;
    const items = response.data.items;

    function findAllByKeys(obj, keysToFind) {
        const results = [];

        function search(current) {
            if (typeof current !== 'object' || current === null) return;

            keysToFind.forEach(key => {
                if (key in current) {
                    results.push({ key, value: current[key] });
                }
            });

            for (const key in current) {
                if (typeof current[key] === 'object') {
                    search(current[key]);
                }
            }
        }

        search(obj);
        return results;
    }

    items.forEach(item => {
        const { id } = item;

        fetch(`${baseUrl}${id}`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${bearerToken}`,
                "Content-Type": "application/json"
            }
        })
            .then(res => {
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                return res.json();
            })
            .then(data => {
                console.log(`✅ Data returned for ID ${id}:`, data);

                const parent = document.querySelector(".content");

                const cont = document.createElement("div");
                cont.classList.add("container");

                const aggname = document.createElement("div");
                aggname.classList.add("aggname");
                aggname.innerText = `${data.data.id} - ${data.data.name}`;
                cont.appendChild(aggname);

                const aggregates = data.data.config?.progress?.AGGREGATE || [];

                aggregates.forEach(aggItem => {
                    const paths = findAllByKeys(aggItem, ['path']);
                    const campaignIds = findAllByKeys(aggItem, ['campaignId']);
                    const types = findAllByKeys(aggItem, ['type']);

                    if (paths.length > 0) {
                        paths.forEach(({ value }) => {
                            const pathname = document.createElement("div");
                            pathname.classList.add("pathname");
                            pathname.innerText = value;
                            cont.appendChild(pathname);
                        });
                    } else if (campaignIds.length > 0) {
                        campaignIds.forEach(({ value }) => {
                            const pathname = document.createElement("div");
                            pathname.classList.add("pathname");
                            pathname.innerText = `Aggregates from campaignId: ${value}`;
                            cont.appendChild(pathname);
                        });
                    } else {
                        types.forEach(({ value }) => {
                            const pathname = document.createElement("div");
                            pathname.classList.add("pathname");
                            pathname.innerText = `type: ${value}`;
                            cont.appendChild(pathname);
                        });
                    }
                });

                parent.appendChild(cont);
            })
            .catch(err => {
                console.error(`❌ Error fetching data for ID ${id}:`, err);
            });
    });
}


async function startProcess() {
    const email = document.querySelector(".emailCMS").value
    const password = document.querySelector(".passwordCMS").value
    const loginUrl = 'https://internal-cms-back.crocobet.com/auth/login';
    const loginPayload = {
        username: email,
        password: password
    };

    try {
        const res = await fetch(loginUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(loginPayload)
        });

        if (!res.ok) throw new Error(`Login failed: ${res.status}`);

        const data = await res.json();
        token = data?.data?.token || data?.accessToken;

        if (!token) throw new Error('Token not found in login response');
        console.log('Authenticated successfully');

        document.querySelector(".login_screen").style.display = "none";

        getData();
    } catch (err) {
        console.error('Login error:', err);
        alert('Login failed. See console.');
        throw err;
    }
}

function togglePassword() {
    const passwordInput = document.getElementById("password-input");
    const toggleBtn = document.querySelector(".toggle-password");
    const isHidden = passwordInput.type === "password";
    passwordInput.type = isHidden ? "text" : "password";
    toggleBtn.textContent = isHidden ? "🙈" : "👁";
}

function goback() {
    window.location.href = "../../../index.html"
}