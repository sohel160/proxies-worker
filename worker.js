export default {
  async fetch(request) {

    const url = new URL(request.url)

    // 🔐 token protection
    if (url.searchParams.get("token") !== "abc123") {
      return new Response("Forbidden", { status: 403 })
    }

    // 🔍 allow only Clash clients
    const ua = request.headers.get("User-Agent") || ""

    const allowedUA = [
      "Clash",
      "clash",
      "Meta",
      "FiClash",
      "Stash",
      "okhttp"
    ]

    if (!allowedUA.some(a => ua.includes(a))) {
      return new Response("404 Not Found", { status: 404 })
    }

    // =========================
    // 📦 PROXY LIST ENDPOINT
    // =========================
    if (url.pathname === "/proxies") {

      const proxies = `
proxies:
  - { name: "HTTP-01", type: http, server: 113.212.109.164, port:  }
  - { name: "HTTP-02", type: http, server: 113.212.109.163, port:  }
  - { name: "HTTP-03", type: http, server: 113.212.109.132, port:  }
  - { name: "HTTP-04", type: http, server: 103.84.36.225, port:  }
  - { name: "HTTP-05", type: http, server: 103.84.36.237, port:  }
  - { name: "HTTP-06", type: http, server: 113.212.109.188, port:  }
  - { name: "HTTP-07", type: http, server: 103.84.36.237, port:  }
  - { name: "HTTP-08", type: http, server: 113.212.109.56, port:  }
  - { name: "HTTP-09", type: http, server: 103.84.38.110, port:  }
  - { name: "HTTP-10", type: http, server: 103.84.38.84, port:  }
  - { name: "HTTP-11", type: http, server: 103.84.38.52, port:  }
  - { name: "HTTP-12", type: http, server: 103.84.37.196, port:  }
  - { name: "HTTP-13", type: http, server: 103.84.37.132, port:  }
  - { name: "HTTP-14", type: http, server: 103.84.37.123, port:  }
  - { name: "HTTP-15", type: http, server: 103.84.37.100, port:  }
  - { name: "HTTP-16", type: http, server: 103.84.37.72, port:   }
  - { name: "HTTP-17", type: http, server: 103.84.36.237, port:  }
`

      return new Response(proxies, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8"
        }
      })
    }

    // =========================
    // ⚡ MAIN CONFIG
    // =========================
    const config = `
proxy-providers:
  myprovider:
    type: http
    url: "${url.origin}/proxies?token=abc123"
    interval: 3600
    path: ./proxies.yaml
    health-check:
      enable: true
      url: http://www.gstatic.com/generate_204
      interval: 60

proxy-groups:

  - name: SELECTOR🔥
    type: select
    proxies:
      - LOAD-BALANCE
      - STABLE

  - name: STABLE
    type: url-test
    url: http://www.gstatic.com/generate_204
    interval: 300
    tolerance: 50
    use:
      - myprovider

  - name: LOAD-BALANCE
    type: load-balance
    strategy: round-robin
    url: http://www.gstatic.com/generate_204
    interval: 60
    use:
      - myprovider

  - name: ALL
    type: select
    use:
      - myprovider

rules:
  # Google services → DIRECT
  - DOMAIN-SUFFIX,google.com,DIRECT
  - DOMAIN-SUFFIX,googleapis.com,DIRECT
  - DOMAIN-SUFFIX,gstatic.com,DIRECT
  - DOMAIN-SUFFIX,googlevideo.com,DIRECT
  - DOMAIN-SUFFIX,youtube.com,DIRECT
  - DOMAIN-SUFFIX,ytimg.com,DIRECT
  - DOMAIN-SUFFIX,ggpht.com,DIRECT
  - DOMAIN-SUFFIX,gvt1.com,DIRECT
  - DOMAIN-SUFFIX,gvt2.com,DIRECT
  - DOMAIN-SUFFIX,gvt3.com,DIRECT
  - DOMAIN-SUFFIX,android.com,DIRECT
  - DOMAIN-SUFFIX,gmail.com,DIRECT
  - DOMAIN-SUFFIX,googleusercontent.com,DIRECT

  # Chrome
  - DOMAIN-SUFFIX,chrome.com,DIRECT
  - DOMAIN-SUFFIX,chromium.org,DIRECT
  - DOMAIN-SUFFIX,googlezip.net,DIRECT

  # Firefox
  - DOMAIN-SUFFIX,mozilla.org,DIRECT
  - DOMAIN-SUFFIX,mozilla.com,DIRECT
  - DOMAIN-SUFFIX,mozilla.net,DIRECT
  - DOMAIN-SUFFIX,firefox.com,DIRECT
  - DOMAIN-SUFFIX,firefox.net,DIRECT

  # Everything else
  - MATCH,SELECTOR🔥
`

    return new Response(config, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8"
      }
    })
  }
}
