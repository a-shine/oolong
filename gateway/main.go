package main

import (
	"errors"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
)

// Create a reverse proxy connection to the backend service host, set the correct URL path for the specific service
// request and serve the request
func connectAndServe(serviceHost string, servicePath string, w http.ResponseWriter, r *http.Request) {
	// Convert the host to a URL and create a reverse proxy connection
	url, _ := url.Parse(serviceHost)
	reverseProxy := httputil.NewSingleHostReverseProxy(url)

	// Add the path for the service request
	r.URL.Path = servicePath

	// Serve the request
	reverseProxy.ServeHTTP(w, r)
}

// serviceHost based of the condition URI which is the first value in the path. If there is no service that corresponds
// to the URI then return ann error.
func serviceHost(proxyConditionRaw string) (string, error) {
	proxyCondition := strings.ToUpper(proxyConditionRaw)
	serviceHost := os.Getenv(proxyCondition)

	if serviceHost == "" {
		return "", errors.New("unknown service")
	}

	return serviceHost, nil
}

// constructServiceRequestURL by breaking down the path of the URL request to the gateway, extracting the host based of
// the first value in the path and then reconstructing the path from what remains.
func constructServiceRequestURL(requestPath string) (string, string) {
	// Break path down by forward slash separator
	pathBreakdown := strings.Split(requestPath, "/")

	// TODO: handle this error - maybe pass the error down to the handleRequest function
	// Obtain the appropriate host for the service based off the first value in the path
	serviceHost, _ := serviceHost(pathBreakdown[1])

	// Reconstruct the remainder of the path after having extracted the service URI
	var servicePath string
	for _, uri := range pathBreakdown[2:] {
		servicePath += uri + "/"
	}

	// Remove the trailing forward slash artifact from the path reconstruction
	servicePath = strings.TrimSuffix(servicePath, "/")

	return serviceHost, servicePath
}

// handleRequest by constructing the URL for the service request. If the incoming request is a request to the
// authentication service, then connect to the service and serve the request. Otherwise, if it is a request to another
// service, check if authenticated by a valid session, connect to the service and serve the request. If no session
// cookie or an invalid session is provided, return an unauthorized response. Route protection is implemented at this
// level.
func handleRequest(w http.ResponseWriter, r *http.Request) {
	// The service host and path are constructed from the request path to the gateway
	requestPath := r.URL.Path
	serviceHost, servicePath := constructServiceRequestURL(requestPath)
	connectAndServe(serviceHost, servicePath, w, r)
}

// API Gateway (reverse-proxy) entrypoint
func main() {
	http.HandleFunc("/", handleRequest)
	http.ListenAndServe(":80", nil)
}
