let token = null;
let signInCount = 0;

async function loginAndGetToken() {
    const loginUrl = 'https://internal-cms-back.crocobet.com/auth/login';
    const loginPayload = {
        username: 'user',
        password: 'pass'
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
    } catch (err) {
        console.error('Login error:', err);
        alert('Login failed. See console.');
        throw err;
    }
}

async function fetchCampaignGroup(id) {
    const url = `https://internal-cms-back.crocobet.com/api/internal/campaign-groups/${id}`;
    const resultContainer = document.getElementById("testResults");
    resultContainer.innerHTML = "";

    try {
        const res = await fetch(url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }
        });

        if (res.status === 401 && signInCount !== 1) {
            signInCount = 1;
            console.warn('401 Unauthorized, retrying after login...');
            await loginAndGetToken();
            return await fetchCampaignGroup(id);
        } else if (res.status === 401 && signInCount !== 1) {
            const li = document.createElement("li");
            li.classList.add("fail");
            li.textContent = "❌ Authorization problem";
            resultContainer.appendChild(li);
        }

        if (signInCount == 1) {
            const li = document.createElement("li");
            li.classList.add("warn");
            li.textContent = "⚠️ Session expired, logging in again ...";
            resultContainer.appendChild(li);
        }

        signInCount = 0;

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);
        const data = await res.json();
        console.log('Campaign Group:', data);

        const li = document.createElement("li");
        li.classList.add("pass");
        li.textContent = "✅ Request successful";

        resultContainer.appendChild(li);

        return data;
    } catch (err) {
        console.error('Fetch error:', err);
        alert('Failed to fetch campaign group. See console.');
        throw err;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startTestBtn');

    startButton.addEventListener('click', async () => {
        const input = document.getElementById('idInput');
        const id = input.value.trim();

        if (!id || isNaN(id)) {
            alert('Please enter a valid numeric ID');
            return;
        }

        try {
            const result = await fetchCampaignGroup(id);
            console.log(result.data)

            const resultContainer = document.getElementById("testResults");
            let liCreate;

            if (!result.data) {
                liCreate = document.createElement("li");
                liCreate.classList.add("fail");
                liCreate.textContent = "❌ Failed to find campaign with ID";
                resultContainer.appendChild(liCreate);
                return;
            }

            if (result.data.enabled == true) {
                liCreate = document.createElement("li");
                liCreate.classList.add("pass");
                liCreate.textContent = "Campaign is active";
                resultContainer.appendChild(liCreate);
            } else {
                liCreate = document.createElement("li");
                liCreate.classList.add("fail");
                liCreate.textContent = "❌ Campaign group is not active, promotion cannot be tested";
                resultContainer.appendChild(liCreate);
                // return;
            }

            liCreate = document.createElement("li");
            liCreate.classList.add("pass");
            liCreate.textContent = "✅ Promotion group UID: " + result.data.uid;
            resultContainer.appendChild(liCreate);

            liCreate = document.createElement("li");
            liCreate.classList.add("pass");
            liCreate.textContent = "✅ Start date: " + formatDate(result.data.startDate);
            resultContainer.appendChild(liCreate);

            liCreate = document.createElement("li");
            liCreate.classList.add("pass");
            liCreate.textContent = "✅ End date: " + formatDate(result.data.endDate);
            resultContainer.appendChild(liCreate);

            if (result.data.campaigns.length == 2) {
                liCreate = document.createElement("li");
                liCreate.classList.add("pass");
                liCreate.textContent = "✅ Group contains only 2 campaigns: " + result.data.campaigns[0]?.id + " and " + result.data.campaigns[1]?.id;
                resultContainer.appendChild(liCreate);
            } else {
                liCreate = document.createElement("li");
                liCreate.classList.add("fail");
                liCreate.textContent = "❌ Group contains more than 2 campaigns, group must be checked manually";
                resultContainer.appendChild(liCreate);
                return;
            }

        } catch (err) {
            // Already handled inside fetchCampaignGroup
        }
    });
});

function formatDate(isoString) {
    const dateObj = new Date(isoString);

    if (isNaN(dateObj)) return "Invalid date";

    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');

    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');

    return `${year}.${month}.${day} ${hours}:${minutes}:${seconds}`;
}

function goback() {
    window.location.href = "../../../index.html"
}