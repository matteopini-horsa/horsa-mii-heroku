sap.ui.define(
    [
        "sap/ui/model/json/JSONModel",
    ],
    function (JSONModel) {
        let init = false;
        const services = new sap.ui.model.json.JSONModel();
        services.loadData(`resources/services.json`)
            .then(
                () => {
                    init = true;
                }
            )

        function get_service(service_name) {

            const services_data = services.getData();
            if (!services_data.services.hasOwnProperty(service_name)) {
                //  Se non esiste il servizio fallback sui file statici
                return get_file(service_name);
            }

            const service = services_data.services[service_name];
            const conf = services_data.conf[service.conf || 'base'];
            const proxy = 'http://localhost:8090/';

            const o = {
                path: `${proxy}${conf.protocol}://${conf.server}${conf.port ? ':' + conf.port : ''}${service.path}`,
                method: service.method || 'GET'
            }

            if (service.auth && conf.auth) {
                if (conf.auth.type === 'querystring') {
                    o.path += (o.path.includes('?') ? '&' : '?') + [conf.auth.uid, conf.auth.pwd].join('&');
                }
            }

            return o;
        }

        function get_file(service_name) {
            return {
                path: `/resources/static/${service_name}.json`,
                method: 'GET'
            };
        }

        //  Crea il template delle colonne in base al tipo di colonna definito da SQLDataType
        function get(service_name) {
            return new Promise((resolve, reject) => {

                (function resolve_service() {
                    if (init) {
                        let o;
                        // if (document.location.hostname === 'localhost') {
                            o = get_service(service_name);
                        // } else {
                        //     o = get_file(service_name);
                        // }

                        const request = new XMLHttpRequest();
                        request.open(o.method, o.path, false);
                        request.send(null);
                        const data = JSON.parse(request.responseText);

                        return resolve(data)
                    }

                    t = setTimeout(resolve_service, 1000)

                })()

            })

        }

        return get
    }
)
