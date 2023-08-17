document.getElementById('domain').addEventListener("keydown", function(event) {
    if (event.key === 'Enter') {
        var domain = document.getElementById('domain').value
        var search = document.getElementById('domain')
        var loading = document.getElementById('loading')
        var table = document.getElementById('response')
        var json = document.getElementById('show-json')
        json.classList.add('d-none')
        document.getElementById('tbody').innerHTML=''
        loading.classList.remove('d-none')
        search.disabled = true
        table.classList.add('d-none')
        document.getElementById('buy-domain').classList.add('d-none')
        fetchData(domain)
    }
});

document.getElementById('back').addEventListener("click", function(event) {
    var table = document.getElementById('response')
    var json = document.getElementById('show-json')
    json.classList.add('d-none')
    table.classList.remove('d-none')
});



async function fetchData(domain) {
    try {
        const headers = new Headers();
        headers.append('X-Api-Key', 'ByduyQKyd0LYUTaFhwD+6w==JXgDqGmcQfSKyB8D');

        const fetchOptions = {
            method: 'GET',
            headers: headers
        };

        var response1, response2, response3;

        if (domain.substr(0, 3) !== 'www') {
            [response1, response2, response3] = await Promise.all([
                fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, fetchOptions),
                fetch(`https://api.api-ninjas.com/v1/whois?domain=${domain}`, fetchOptions),
                fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=www.${domain}`, fetchOptions)
            ]);
        } else {
            [response1, response2, response3] = await Promise.all([
                fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain.replace(/www\./g, '')}`, fetchOptions),
                fetch(`https://api.api-ninjas.com/v1/whois?domain=${domain}`, fetchOptions),
                fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, fetchOptions)
            ]);
        }
        
        const data1 = await response1.json();
        const data2 = await response2.json();
        const data3 = await response3.json();
        console.log(data1)
        console.log(data2)
        console.log(data3)


        if(Object.keys(data1).length == 0 && Object.keys(data2).length == 0){
            var response4;
            response4 = await fetch(`http://18.228.11.185:80/${domain.replace(/www\./g, '')}`,{
                method: 'GET'
            })

            const data4 = await response4.json();
            console.log(data4)
            if(data4.DomainStatus == "AVAILABLE"){
                var loading = document.getElementById('loading')
                var table = document.getElementById('response')
                var json = document.getElementById('show-json')
                var search = document.getElementById('domain')
                loading.classList.add('d-none')
                table.classList.add('d-none')
                search.disabled = false
                document.getElementById('buy-domain').classList.remove('d-none')
                document.getElementById('domain-available').textContent = domain.replace(/www\./g, '')
            }else{
                alert('Opa, esse dominio não tá disponível para compra e não possui dados no whois')
                var search = document.getElementById('domain')
                var loading = document.getElementById('loading')
                search.disabled = false
                loading.classList.add('d-none')
            }

        }else{

        // Tratar os dados retornados
        const whois = {};
        const dataA2 = data3;
        const dataA1 = data1.filter(obj => obj.record_type === "A" || obj.record_type === "AAAA" || obj.record_type === "CNAME")
        const dataSOA = data1.filter(obj => obj.record_type === "SOA")
        let SPF = data1.filter(obj => obj.record_type === "TXT")


        if (data2.hasOwnProperty('domain_name')) {
          whois.domain_name = data2.domain_name;
        }

        if (data2.hasOwnProperty('registrant_name')) {
            whois.registrant_name = data2.registrant_name;
        }
        
        if (data2.hasOwnProperty('creation_date')) {
            var creationDateInSeconds;
            if(typeof(data2.creation_date) == 'object'){
                var orderCre = data2.creation_date.sort((a, b) => b - a)
                creationDateInSeconds = orderCre[0];
            }else{
                creationDateInSeconds = data2.creation_date
            }
            const creationDateInMilliseconds = creationDateInSeconds * 1000;
            const new_date = new Date(creationDateInMilliseconds)
            const dia = String(new_date.getDate()).padStart(2, '0');
            const mes = String(new_date.getMonth() + 1).padStart(2, '0');
            const ano = new_date.getFullYear();
            whois.creation_date = `${dia}/${mes}/${ano}`;
        }
        
        if (data2.hasOwnProperty('expiration_date')) {
            var expirationDateInSeconds = data2.expiration_date;
            if(typeof(data2.expiration_date) == 'object'){
                var orderExp = data2.expiration_date.sort((a, b) => a - b)
                expirationDateInSeconds = orderExp[0];
            }else{
                expirationDateInSeconds = data2.expiration_date
            }
            const expirationDateInMilliseconds = expirationDateInSeconds * 1000;
            const new_date = new Date(expirationDateInMilliseconds)
            const dia = String(new_date.getDate()).padStart(2, '0');
            const mes = String(new_date.getMonth() + 1).padStart(2, '0');
            const ano = new_date.getFullYear();
            whois.expiration_date = `${dia}/${mes}/${ano}`;
        }

        const tableBody = document.getElementById('tbody');
        dataA1.forEach(obj => {
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            cell1.textContent = domain.replace(/www\./g, '');
            const cell2 = document.createElement('td');
            cell2.textContent = obj.record_type;
            const cell3 = document.createElement('td');
            cell3.textContent = obj.value;
            if(obj.record_type == 'AAAA'){
                cell1.className = 'fw-bold text-warning';
                cell2.className = 'fw-bold text-warning';
                cell3.className = 'fw-bold text-warning';
            }else if(obj.record_type == 'CNAME'){
                cell3.textContent = obj.value.substr(0, [obj.value.split('').length -1])
            }
            row.append(cell1, cell2, cell3);
            tableBody.appendChild(row);
        })

        dataSOA.forEach(obj => {
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            cell1.textContent = domain.replace(/www\./g, '');
            const cell2 = document.createElement('td');
            cell2.textContent = obj.record_type;
            const cell3 = document.createElement('td');
            cell3.textContent = obj.rname;
            row.append(cell1, cell2, cell3);
            tableBody.appendChild(row);
        })

        dataA2.forEach(obj => {
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            cell1.textContent = 'www.'+domain.replace(/www\./g, '');
            const cell2 = document.createElement('td');
            cell2.textContent = obj.record_type;
            const cell3 = document.createElement('td');
            if(obj.value == null || obj.value == undefined){
                if(obj.record_type === 'SOA'){
                    cell3.textContent = obj.rname
                }else{
                    cell3.textContent = 'Consulte no JSON'
                }
            }else{
                cell3.textContent = obj.value;
            }
            if(obj.record_type == 'CNAME'){
                cell3.textContent = obj.value.substr(0, [obj.value.split('').length -1])
                console.log(obj.value.substr(0, [obj.value.split('').length -1]))
            }
            row.append(cell1, cell2, cell3);  
            tableBody.appendChild(row);
        });

        if (dataSOA.length === 0 && data2.hasOwnProperty('name_server')) {
            try {
                whois.name_server = data2.name_server[0];
            } catch (error) {
                whois.name_server = data2.name_server;                            
            }
        }

        Object.entries(whois).forEach(([chave, valor]) => {
            const row = document.createElement('tr');
            const cell1 = document.createElement('td');
            cell1.textContent = domain.replace(/www\./g, '');
            const cell2 = document.createElement('td');
            cell2.textContent = chave;
            const cell3 = document.createElement('td');
            cell3.textContent = valor;
            if(chave == 'expiration_date'){
                const dataObjeto = new Date();
                const dataMilissegundos = dataObjeto.getTime();
                const date = valor;
                const partes = date.split('/'); 
                const dia = parseInt(partes[0], 10);
                const mes = parseInt(partes[1], 10) - 1; 
                const ano = parseInt(partes[2], 10);
                const expDate = new Date(ano, mes, dia);
                // console.log(expDate.getTime())
                // console.log(dataMilissegundos);
                if(dataMilissegundos >= expDate.getTime()){
                    cell1.className = 'fw-bold text-danger'
                    cell2.className = 'fw-bold text-danger'
                    cell3.className = 'fw-bold text-danger'
                    cell3.textContent = cell3.textContent + ' (Domínio Congelado)'
                    var span = document.getElementById('status')
                    span.textContent = 'CONGELADO'
                    span.className = 'text-danger'
                }else{
                    var span = document.getElementById('status')
                    span.textContent = 'ATIVO'
                    span.className = 'text-success'
                }
            }
            row.append(cell1, cell2, cell3);  
            tableBody.appendChild(row);
        });

        if(Object.keys(whois).length == 0 && Object.keys(data1).length == 0){
            var span = document.getElementById('status')
            span.textContent = 'ATIVO'
            span.className = 'text-success'
        }
// console.log(SPF)
        if(Object.keys(SPF).length != 0){
            SPF.forEach(obj => {
                const row = document.createElement('tr');
                const cell1 = document.createElement('td');
                cell1.textContent = domain.replace(/www\./g, '');
                const cell2 = document.createElement('td');
                cell2.textContent = obj.record_type;
                const cell3 = document.createElement('td');
                cell3.textContent = obj.value;
                cell1.className = 'd-none'
                cell2.className = 'd-none'
                cell3.className = 'd-none'
                cell1.setAttribute('name', 'SPF');
                cell2.setAttribute('name', 'SPF');
                cell3.setAttribute('name', 'SPF');
                row.append(cell1, cell2, cell3);  
                tableBody.appendChild(row);
                var btnSPF = document.getElementById('spf');
                var btnSPFhide = document.getElementById('spfhide');
                btnSPFhide.classList.add('d-none')
                btnSPF.classList.remove('d-none')
            });
        }else{
            var btnSPF = document.getElementById('spf');
            var btnSPFhide = document.getElementById('spfhide');
            btnSPFhide.classList.add('d-none')
            btnSPF.classList.add('d-none')
        }


            // console.log(dataSOA);
            // console.log(whois);
            // console.log(data3);


            // Prosseguir com o código após o retorno das duas requisições Fetch
            console.log('Continuando com o código...');
            var search = document.getElementById('domain')
            var h3 = document.getElementById('domain-name')
            var table = document.getElementById('response')
            var loading = document.getElementById('loading')
            var json = document.getElementById('show-json')
            loading.classList.add('d-none')
            json.classList.add('d-none')
            h3.textContent = domain.replace(/www\./g, '');
            table.classList.remove('d-none')
            search.disabled = false

            document.getElementById('json').addEventListener("click", function(event) {
                table.classList.add('d-none')
                json.classList.remove('d-none')
                document.getElementById('data1').innerText = JSON.stringify(data1, null, 2)
                document.getElementById('data2').innerText = JSON.stringify(data2, null, 2)
                document.getElementById('data3').innerText = JSON.stringify(data3, null, 2)
            });
            document.getElementById('spf').addEventListener("click", function(event) {
                const cells = document.getElementsByName('SPF')
                for(obj in cells){
                    cells[obj].className = 'SPF'
                }
                document.getElementById('spfhide').classList.remove('d-none')
                document.getElementById('spf').classList.add('d-none')

            });
            document.getElementById('spfhide').addEventListener("click", function(event) {
                const cells = document.getElementsByName('SPF')
                for(var obj of cells){
                    obj.className = 'd-none SPF'
                };
                document.getElementById('spfhide').classList.add('d-none')
                document.getElementById('spf').classList.remove('d-none')
            });
        }

    } catch (error) {
        // Lidar com erros das requisições
        console.log(error)
        try {
            const headers = new Headers();
            headers.append('X-Api-Key', 'ByduyQKyd0LYUTaFhwD+6w==JXgDqGmcQfSKyB8D');
    
            const fetchOptions = {
                method: 'GET',
                headers: headers
            };
    
            var response1, response2;
    
            if (domain.substr(0, 3) !== 'www') {
                [response1, response2] = await Promise.all([
                    fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, fetchOptions),
                    fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=www.${domain}`, fetchOptions)
                ]);
            } else {
                [response1, response2] = await Promise.all([
                    fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain.replace(/www\./g, '')}`, fetchOptions),
                    fetch(`https://api.api-ninjas.com/v1/dnslookup?domain=${domain}`, fetchOptions)
                ]);
            }
            
            const data1 = await response1.json();
            const data2 = await response2.json();

            if(Object.keys(data1).length == 0 && Object.keys(data2).length == 0){
                var response4;
                response4 = await fetch(`http://18.228.11.185:80/${domain.replace(/www\./g, '')}`,{
                    method: 'GET'
                })
    
                const data4 = await response4.json();
                console.log(data4)
                if(data4.DomainStatus == "AVAILABLE"){
                    var loading = document.getElementById('loading')
                    var table = document.getElementById('response')
                    var json = document.getElementById('show-json')
                    var search = document.getElementById('domain')
                    loading.classList.add('d-none')
                    table.classList.add('d-none')
                    search.disabled = false
                    document.getElementById('buy-domain').classList.remove('d-none')
                    document.getElementById('domain-available').textContent = domain.replace(/www\./g, '')
                }else{
                    alert('Opa, esse dominio não tá disponível para compra e não possui dados em nenhuma API')
                    var search = document.getElementById('domain')
                    var loading = document.getElementById('loading')
                    search.disabled = false
                    loading.classList.add('d-none')
                }
    
            }else{

                const dataA1 = data1.filter(obj => obj.record_type === "A" || obj.record_type === "AAAA" || obj.record_type === "CNAME")
                const dataSOA = data1.filter(obj => obj.record_type === "SOA")
                let SPF = data1.filter(obj => obj.record_type === "TXT")
                const dataA2 = data2;

                console.log(data1)
                console.log(data2)


    
                const tableBody = document.getElementById('tbody');
                dataA1.forEach(obj => {
                    const row = document.createElement('tr');
                    const cell1 = document.createElement('td');
                    cell1.textContent = domain.replace(/www\./g, '');
                    const cell2 = document.createElement('td');
                    cell2.textContent = obj.record_type;
                    const cell3 = document.createElement('td');
                    cell3.textContent = obj.value;
                    if(obj.record_type == 'AAAA'){
                        cell1.className = 'fw-bold text-warning';
                        cell2.className = 'fw-bold text-warning';
                        cell3.className = 'fw-bold text-warning';
                    }else if(obj.record_type == 'CNAME'){
                        cell3.textContent = obj.value.substr(0, [obj.value.split('').length -1])
                    }
                    row.append(cell1, cell2, cell3);
                    tableBody.appendChild(row);
                })

                dataSOA.forEach(obj => {
                    const row = document.createElement('tr');
                    const cell1 = document.createElement('td');
                    cell1.textContent = domain.replace(/www\./g, '');
                    const cell2 = document.createElement('td');
                    cell2.textContent = obj.record_type;
                    const cell3 = document.createElement('td');
                    cell3.textContent = obj.rname;
                    row.append(cell1, cell2, cell3);
                    tableBody.appendChild(row);
                })


                dataA2.forEach(obj => {
                    const row = document.createElement('tr');
                    const cell1 = document.createElement('td');
                    cell1.textContent = 'www.'+domain.replace(/www\./g, '');
                    const cell2 = document.createElement('td');
                    cell2.textContent = obj.record_type;
                    const cell3 = document.createElement('td');
                    if(obj.value == null || obj.value == undefined){
                        if(obj.record_type === 'SOA'){
                            cell3.textContent = obj.rname
                        }else{
                            cell3.textContent = 'Consulte no JSON'
                        }
                    }else{
                        cell3.textContent = obj.value;
                    }
                    if(obj.record_type == 'CNAME'){
                        cell3.textContent = obj.value.substr(0, [obj.value.split('').length -1])
                    }
                    row.append(cell1, cell2, cell3);  
                    tableBody.appendChild(row);
                });

                // console.log(SPF)
                if(Object.keys(SPF).length != 0){
                    SPF.forEach(obj => {
                        const row = document.createElement('tr');
                        const cell1 = document.createElement('td');
                        cell1.textContent = domain.replace(/www\./g, '');
                        const cell2 = document.createElement('td');
                        cell2.textContent = obj.record_type;
                        const cell3 = document.createElement('td');
                        cell3.textContent = obj.value;
                        cell1.className = 'd-none'
                        cell2.className = 'd-none'
                        cell3.className = 'd-none'
                        cell1.setAttribute('name', 'SPF');
                        cell2.setAttribute('name', 'SPF');
                        cell3.setAttribute('name', 'SPF');
                        row.append(cell1, cell2, cell3);  
                        tableBody.appendChild(row);
                        var btnSPF = document.getElementById('spf');
                        var btnSPFhide = document.getElementById('spfhide');
                        btnSPFhide.classList.add('d-none')
                        btnSPF.classList.remove('d-none')
                    });
                }else{
                    var btnSPF = document.getElementById('spf');
                    var btnSPFhide = document.getElementById('spfhide');
                    btnSPFhide.classList.add('d-none')
                    btnSPF.classList.add('d-none')
                }
        
                if(Object.keys(data1).length != 0 || Object.keys(data2).length != 0){
                    var span = document.getElementById('status')
                    span.textContent = 'ATIVO'
                    span.className = 'text-success'
                }else{
                    var span = document.getElementById('status')
                    span.textContent = 'SEM DADOS'
                    span.className = 'text-info'
                }

                console.log('Continuando com o código...');
                var search = document.getElementById('domain')
                var h3 = document.getElementById('domain-name')
                var table = document.getElementById('response')
                var loading = document.getElementById('loading')
                var json = document.getElementById('show-json')
                loading.classList.add('d-none')
                json.classList.add('d-none')
                h3.textContent = domain.replace(/www\./g, '');
                table.classList.remove('d-none')
                search.disabled = false

                document.getElementById('json').addEventListener("click", function(event) {
                    table.classList.add('d-none')
                    json.classList.remove('d-none')
                    document.getElementById('data1').innerText = JSON.stringify(data1, null, 2)
                    document.getElementById('data2').innerText = 'Internal Server ERROR 502'
                    document.getElementById('data3').innerText = JSON.stringify(data2, null, 2)
                });
                document.getElementById('spf').addEventListener("click", function(event) {
                    const cells = document.getElementsByName('SPF')
                    for(obj in cells){
                        cells[obj].className = 'SPF'
                    }
                    document.getElementById('spfhide').classList.remove('d-none')
                    document.getElementById('spf').classList.add('d-none')
    
                });
                document.getElementById('spfhide').addEventListener("click", function(event) {
                    const cells = document.getElementsByName('SPF')
                    for(var obj of cells){
                        obj.className = 'd-none SPF'
                    };
                    document.getElementById('spfhide').classList.add('d-none')
                    document.getElementById('spf').classList.remove('d-none')
                });
            }
        }catch(error){
            try {
                const headers = new Headers();
                headers.append('X-Api-Key', 'ByduyQKyd0LYUTaFhwD+6w==JXgDqGmcQfSKyB8D');
        
                const fetchOptions = {
                    method: 'GET',
                    headers: headers
                };
        
                var response1;
        
                [response1] = await Promise.all([
                    fetch(`https://api.api-ninjas.com/v1/whois?domain=${domain.replace(/www\./g, '')}`, fetchOptions),
                ]);
                
                const data1 = await response1.json();

                if(Object.keys(data1).length == 0){
                    var response4;
                    response4 = await fetch(`http://18.228.11.185:80/${domain.replace(/www\./g, '')}`,{
                        method: 'GET'
                    })
        
                    const data4 = await response4.json();
                    console.log(data4)
                    if(data4.DomainStatus == "AVAILABLE"){
                        var loading = document.getElementById('loading')
                        var table = document.getElementById('response')
                        var json = document.getElementById('show-json')
                        var search = document.getElementById('domain')
                        loading.classList.add('d-none')
                        table.classList.add('d-none')
                        search.disabled = false
                        document.getElementById('buy-domain').classList.remove('d-none')
                        document.getElementById('domain-available').textContent = domain.replace(/www\./g, '')
                    }else{
                        alert('Opa, esse dominio não tá disponível para compra e não possui dados em nenhuma API')
                        var search = document.getElementById('domain')
                        var loading = document.getElementById('loading')
                        search.disabled = false
                        loading.classList.add('d-none')
                    }
        
                }else{

                    const whois = {}

                    console.log(data1)

                    const tableBody = document.getElementById('tbody');

                    
                    if (data1.hasOwnProperty('domain_name')) {
                        whois.domain_name = data1.domain_name;
                    }
            
                    if (data1.hasOwnProperty('registrant_name')) {
                        whois.registrant_name = data1.registrant_name;
                    }

                    if (data1.hasOwnProperty('name_server')) {
                        try {
                            whois.name_server = data1.name_server[0];
                        } catch (error) {
                            whois.name_server = data1.name_server;                            
                        }
                    }
                    
                    if (data1.hasOwnProperty('creation_date')) {
                        var creationDateInSeconds;
                        if(typeof(data1.creation_date) == 'object'){
                            var orderCre = data1.creation_date.sort((a, b) => b - a)
                            creationDateInSeconds = orderCre[0];
                        }else{
                            creationDateInSeconds = data1.creation_date
                        }
                        const creationDateInMilliseconds = creationDateInSeconds * 1000;
                        const new_date = new Date(creationDateInMilliseconds)
                        const dia = String(new_date.getDate()).padStart(2, '0');
                        const mes = String(new_date.getMonth() + 1).padStart(2, '0');
                        const ano = new_date.getFullYear();
                        whois.creation_date = `${dia}/${mes}/${ano}`;
                    }
                    
                    if (data1.hasOwnProperty('expiration_date')) {
                        var expirationDateInSeconds = data1.expiration_date;
                        if(typeof(data1.expiration_date) == 'object'){
                            var orderExp = data2.expiration_date.sort((a, b) => a - b)
                            expirationDateInSeconds = orderExp[0];
                        }else{
                            expirationDateInSeconds = data1.expiration_date
                        }
                        const expirationDateInMilliseconds = expirationDateInSeconds * 1000;
                        const new_date = new Date(expirationDateInMilliseconds)
                        const dia = String(new_date.getDate()).padStart(2, '0');
                        const mes = String(new_date.getMonth() + 1).padStart(2, '0');
                        const ano = new_date.getFullYear();
                        whois.expiration_date = `${dia}/${mes}/${ano}`;
                    }

                    


                    Object.entries(whois).forEach(([chave, valor]) => {
                        const row = document.createElement('tr');
                        const cell1 = document.createElement('td');
                        cell1.textContent = domain.replace(/www\./g, '');
                        const cell2 = document.createElement('td');
                        cell2.textContent = chave;
                        const cell3 = document.createElement('td');
                        cell3.textContent = valor;
                        if(chave == 'expiration_date'){
                            const dataObjeto = new Date();
                            const dataMilissegundos = dataObjeto.getTime();
                            const date = valor;
                            const partes = date.split('/'); 
                            const dia = parseInt(partes[0], 10);
                            const mes = parseInt(partes[1], 10) - 1; 
                            const ano = parseInt(partes[2], 10);
                            const expDate = new Date(ano, mes, dia);
                            // console.log(expDate.getTime())
                            // console.log(dataMilissegundos);
                            if(dataMilissegundos >= expDate.getTime()){
                                cell1.className = 'fw-bold text-danger'
                                cell2.className = 'fw-bold text-danger'
                                cell3.className = 'fw-bold text-danger'
                                cell3.textContent = cell3.textContent + ' (Domínio Congelado)'
                                var span = document.getElementById('status')
                                span.textContent = 'CONGELADO'
                                span.className = 'text-danger'
                            }else{
                                var span = document.getElementById('status')
                                span.textContent = 'ATIVO'
                                span.className = 'text-success'
                            }
                        }
                        row.append(cell1, cell2, cell3);  
                        tableBody.appendChild(row);
                    });
        
                    var btnSPF = document.getElementById('spf');
                    btnSPF.classList.add('d-none')
            
                    if(Object.keys(data1).length != 0){
                        var span = document.getElementById('status')
                        span.textContent = 'ATIVO'
                        span.className = 'text-success'
                    }else{
                        var span = document.getElementById('status')
                        span.textContent = 'SEM DADOS'
                        span.className = 'text-info'
                    }

                    console.log('Continuando com o código...');
                    var search = document.getElementById('domain')
                    var h3 = document.getElementById('domain-name')
                    var table = document.getElementById('response')
                    var loading = document.getElementById('loading')
                    var json = document.getElementById('show-json')
                    loading.classList.add('d-none')
                    json.classList.add('d-none')
                    h3.textContent = domain.replace(/www\./g, '');
                    table.classList.remove('d-none')
                    search.disabled = false

                    document.getElementById('json').addEventListener("click", function(event) {
                        table.classList.add('d-none')
                        json.classList.remove('d-none')
                        document.getElementById('data1').innerText = 'Internal Server ERROR 502'
                        document.getElementById('data2').innerText = JSON.stringify(data1, null, 2)
                        document.getElementById('data3').innerText = 'Internal Server ERROR 502'
                    });
                }
            } catch (error) {
                console.log(error)

                var table = document.getElementById('response')
                var search = document.getElementById('domain')
                var loading = document.getElementById('loading')
                table.classList.add('d-none')
                loading.classList.add('d-none')
                search.disabled = false
                alert('Ops, Não deu muito certo. Objeto está quebrado ou o site não existe')
            }

        }
        

    }
}

function welcomeMessage(){
    const myModal = new bootstrap.Modal(document.getElementById("welcomeModal"), {});
    myModal.show();
    localStorage.setItem('welcomeMessage', 'true')
}

function apiMessage(){
    const myModal = new bootstrap.Modal(document.getElementById("apiMessage"), {});
    myModal.show();
    localStorage.setItem('apiMessage', 'true')
}


if(!localStorage.getItem('welcomeMessage')){
    welcomeMessage()
}else if(!localStorage.getItem('apiMessage')){
    apiMessage()
}
