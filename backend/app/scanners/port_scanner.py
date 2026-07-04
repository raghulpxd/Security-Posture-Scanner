import socket


COMMON_PORTS = {
    21: "FTP",
    22: "SSH",
    25: "SMTP",
    53: "DNS",
    80: "HTTP",
    110: "POP3",
    143: "IMAP",
    443: "HTTPS",
    3306: "MySQL",
    3389: "RDP",
    8080: "HTTP Alternate"
}


def scan_ports(domain):

    result = {
        "ip": "",
        "open_ports": [],
        "issues": []
    }

    try:

        ip = socket.gethostbyname(domain)

        result["ip"] = ip

        for port, service in COMMON_PORTS.items():

            sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            sock.settimeout(0.5)

            status = sock.connect_ex((ip, port))

            if status == 0:

                result["open_ports"].append({
                    "port": port,
                    "service": service
                })

            sock.close()

    except Exception as e:

        result["issues"].append(str(e))

    return result