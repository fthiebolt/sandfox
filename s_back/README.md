# PROJET SANDFOX
## Installation et mise en marche
Pour le développement, `npm install` depuis les répos puis lancer les deux script \front/start.sh et \backend/start.sh
L'application sera disponible à l'adresse http://localhost:4200

En production, voir la partie *mise en ligne Neocampus*.

## Gestion des utilisateurs, alarmes et notifications
Géré sous free MongoDB (à sécuriser), possibilité de visualisation via [MongoDB Compass](https://www.mongodb.com/products/compass) ou tout autre outils de visualisation.
**SDD disponibles dans le dossier models**
En cas de modifications, reporter du côté front également mais MongoDB offre une grande liberté dans les types (possible d'avoir dans la même table plusieurs représentations du même type d'objet - *à éviter cependant*)

L'ancien système de demoData y est toujours stocké en cas de rollback. Données de fin 2016 à mi 2017.
## Récupération des données
### Demo

 - Voir commentaires dans la partie backend (**influx.db.ts**)
 - En cas de changement de BDD (influx vers X) il suffit de remplacer les appels à influx.db.ts par un nouveau contrôleur. Tout est prêt et modulable.

### NeoData
	Les informations ci-dessous sont amenées à changer en fonction de l'intégration des données du SGE par neOCampus via la plateforme NeoData
Voir la doc -> [NeoData](https://neocampus.univ-tlse3.fr/_media/neocampus_data_user_guide.pdf)

Connexion possible **uniquement** via une machine du réseau UT3, pour travailler à distance voir l'accès au réseau distant [VPN UPS](https://www.univ-tlse3.fr/acces-reseau-distant-vpn-1) ou via ssh sur une machine de TP de la salle U4-203.

**Évolution** :

|Zone| 2020 | |
|-------------------------|------------------|---------------------------------| 
| Landing AREA (raw datas)| before Apr.20 | [mongoDB]; neOCampusDB *'measure'* |
| | after Apr.20 |[mongoDB]; neOCampus_datalakeDB *'sensors'*                  |
| Work ZONE | from May.17 | [InfluxDB2.0] *'sensors'* bucket / MQTT metrics    | 
| Golden AREA| from June.20 |[InfluxDB2.0] *'sensors_week/_month/_year'* bucket |

Dans l'actuelle Work Zone (*non prévue pour l'usage end-user*) les données sont représentées comme suit :
**TAGS**

* location | ut3, ensimag, carcassonne, metropole, ...
* building | u3, u4, ...
* room | 300, 301, 302 | undefined pour les capteurs généraux
* kind | temperature, wind, **energy**
* unitID | *as in payload* : capterID, O-S-E-N, usage, ...
* subID | *as in payload* : heaters, lightning, prise, ..  | *sans doute energy-kind pour SGE*

**FIELDS** - *actuellement sous forme d'Arrays stockés en String*

* value | *as in payload* 
* value_unit | *as in payload*
 
 **Exemple de Query NeoData** -> Stocke en vue d'un affichage les différents couples bâtiments / salle rencontrés OU affiche séquentiellement les résultats de la requête.
```javascript
const client = new InfluxDB({url: String(process.env.INFLUX_URL), token: token});
const queryApi = client.getQueryApi(String(process.env.INFLUX_ORG)
let buildingList:{name:string, rooms: string[]}[] = []
let fluxQuery = 'from(bucket:"sensors") |> range(start:-1y) |> filter(fn:(r) => r.kind == "energy") |> last()'

queryApi.queryRows(fluxQuery, {
	next(row, tableMeta){
		const b = tableMeta.toObject(row) //parse qResult by rows
	    if(showTest){ //tester for réu - prints rooms available for energy kind
			if(!buildingList.find(e => e.name === b.building)){
				buildingList.push({name: b.building, rooms:[b.room]})
			} else if(!buildingList[buildingList.findIndex(e => e.name = b.building)].rooms.includes(b.room)){
				buildingList[buildingList.findIndex(e => e.name = b.building)].rooms.push(b.room)
			}
		} else { //tester for réu - 
			console.log(b._measurement + ", " + b._time + " |> " + b._field + " |> " + b.location + "/" + b.building + "/" +b.room + "__" + b.kind + "/" + b.subID + "/" + b.unitID+ " - \t" +b._value)
		}
	},
	error(error) {
		console.error('QUERY FAILED', error)
	},
	complete() {
		console.log('QUERY FINISHED')
		if(showTest){
			buildingList.forEach(b => {b.rooms.forEach(e => console.log("name : " + b.name + " - room : " + e))})
		}
	},
})
```
Attention, le package JS d'InfluxDB2.0 est très mal documenté (*voir en dans les package référence en bas*), l'exemple ci-dessus est issu de mes propres expérimentations, pour des requêtes mieux construites, se référer à influx.db.ts en mode demo. Tous les console.log() sont prêts à décommenter pour observer en direct le fonctionnement. 

Attention, certaines entrées sont des tableaux stockés en String, exemple : `o._value = "[5807324.0, 5807320.0, 235.5, 1.59, 320.0, 200.0, 370.0, 0.85]"`

Voici comment contourner le problème et récupérer tout ou partie du tableau en JS :
```javascript
value: parseFloat(o._value.substring(1, o._value.length-1).split(',')[indice])
```

Le **système de salles** n'est pas intégré au front mais tout est prêt côté backend, voir chaîne de commentaires dans les sdd et composants.


## Visualisation des données
	La visualisation des données demande une transformation séquentielle du type IData[] vers ILineData[],
	attention donc aux gros volumes de données. 
*voir ngx-charts* -> [*doc*](https://github.com/swimlane/ngx-charts)

Les modules de visualisation sont gérés dans \front/composant data-viewer2.component et font appel au data-manager.service

## Dialogue Front/Back
### API RESTful
	|Rest Web Service Server|
	|↑HTTP Req     HTTP Res↓|
	|---------CLIENT--------|

> REST is intended to evoke an image of how a well-designed Web application behaves: a network of web pages (a virtual state-machine), where the user progresses through an application by selecting links (state transitions), resulting in the next page (representing the next state of the application) being transferred to the user and rendered for their use.
[- Roy Fielding in his Ph.D. dissertation in the year 2000](http://www.ics.uci.edu/~fielding/pubs/dissertation/rest_arch_style.htm)

Il s'agit d'un échange sous format JSON/XML qui prends 4 methodes possibles:

 - DELETE	// supprimer une entrée
 - PUT //Ajouter une entrée
 - GET // Demander une entrée
 - POST //Mettre à jour une entrée

Au niveau back-end c'est géré par le router (voir **app.ts**, **server.ts** et le dossier API) `initializeControllers(controllers:any[])`

Pour ajouter un nouveau contrôleur il faut donc ajouter son PATH dans l'initialisation de server.ts puis le composant correspondant dans le dossier API.
Au niveau front-end il s'agit d'un service qui passe par le système d'authentification

EXEMPLE : 

    const  datas = await  this.authService.get<T | null>('/api/yourAPI/', { params: { type, ... } }).toPromise();

## Mise en ligne neOCampus
Utilisation de docker, sshd et supervisord -> [*exemple*](https://github.com/fthiebolt/teaching-IoT/tree/master/tutorial-MQTT-FLASK-DOCKER)
DockerHub : sandf0x/sandfox-docker -> [*fichiers*](https://drive.google.com/drive/folders/1k92gxV7qKT0yMzkfVOjbTW14duuL0itV?usp=sharing)

> Docker n'étant utilisable que sous root, on utilise docker et supervisord pour créer un daemon qui écoute les connexions SSH à notre docker sur le serveur de neOCampus.


### Se connecter
  - Ajouter sa clé RSA publique à \docker/app/authorized_keys
  - Build&push le docker dans le repo sandf0x et demander l'actualisation à Mr Thiebolt
  - Connexion ssh à neocampus.univ-tlse3.fr -p $(PORT)
 **Mise à jour** :
 `git clone https://username:password@backend_url`
 `git clone https://username:password@front_url `
 `cd front && ng build --prod` 
 `cd ../backend && npm run build`
 `mv ../front/dist./public` 
 `npm run start`
 
/!\ *L'application s’exécute  en production sur le port 8080 par defaut, penser à changer le port dans front/src/environments/environments.prod.ts et dans backend/.env selon la nouvelle redirection choisie par Mr Thiebolt*

## TODO

 - [x] Transition InfluxDB2.0
 - [x] Préparation en vue de l'intégration NeoData/SGE *(attendre maintenant l'ingestion du SGE par NeoData)*
 - [ ] Vérifier le système de notifications après avoir vu plusieurs notfications (ne doit s'actualiser que si la dernière notification n'est pas lue)
 - [ ] Améliorer le système de génération (Certaines tables des fichiers xlsx auquels j'ai eut accès étaient triés dans l'ordre croissant de données mais les dates ne correspondaient pas. La génération est donc faussée pour quelques bâtiments) - voir **data-gen .py** pour le formatage des fichiers .json
 - [ ] Finalisation du système d'API push, nécessite des tests dans un environnement de production (*voir chaîne de commentaire backend et dé commenter, le squelette est là mais je n'ai pas pu tester encore*)

## TOFIX

 - [ ] Disparition partielle du map layer en cas de changement de composant après avoir ouvert puis refermé plusieurs fois le data-manager (*voir du côté de la redimension automatique ?*)

## Technologies utilisées

- Angular CLI 7.3.4 - [doc](https://v7.angular.io/docs)
- NodeJS
- ExpressJS
- mongoDB
- InfluxDB2.0 - [doc](https://v2.docs.influxdata.com/v2.0/get-started/) - [doc client](https://v2.docs.influxdata.com/v2.0/reference/api/client-libraries/) - 
- Bootstrap
- D3.js
- OpenStreetMap
- WebPack

## Comptes
 - Google (pour le mailer et la push api)
 - DockerHub @sandf0x
 - InfluxCloud2.0 - DemoDB

#*logs à demander*
