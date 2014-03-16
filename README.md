#garment-disasters-timeline

N.B.: The current version is slightly broken because it is assumed that the SQL query responses come back in the order in which they were issued.

A simple web-based visualization of garment factory disasters in Bangladesh, the initial version of which was created in the wake of the [Rana Plaza disaster](http://en.wikipedia.org/wiki/2013_Savar_building_collapse). See it at http://clothing.norainnosun.de/.

##Setup
After cloning, you need to run the following two commands on the repository:

    git submodule init
    git submodule update

Then serve index.html with a web server of your choice.

##Data
A couple of reports that deal with the history of incidents and their causes are:

[Hazardous workplaces: Making the Bangladesh Garment industry safe](http://www.cleanclothes.org/resources/publications/2012-11-hazardousworkplaces.pdf/at_download/file)

[Fair Wear Foundation Background Study BANGLADESH, Fair Wear Foundation, 2006](http://www.fairwear.org/ul/cms/fck-uploaded/archive/2010-01/bangladesh_fwf_country_study.pdf)

Other sources are contained in the data. Many of the geographic coordinates in the data are rough and when multiple entries existed for an area or city without exact locations, they were moved around so that multiple entries could be seen on the map. There is a project going on to map Bangladesh's garment factories (see below) as well as pool and organize data on the factories more generally; through this we hope to obtain better coordinates.

##How it works
The visualization grabs its data from a [CartoDB](http://www.cartodb.com/) ([PostgreSQL](http://www.postgresql.org/)) database using their [JavaScript API](http://developers.cartodb.com/documentation/cartodb-js.html).

Using [Leaflet](http://leafletjs.com/), vector graphics layers based on the data from each year are displayed according to a [jQueryUI slider](http://jqueryui.com/slider/) position.

The stacked bar chart uses [d3.js](http://d3js.org/). We adapted [code placed online by Ben Christensen](https://gist.github.com/benjchristensen/1488375), which was more than what we needed. You can track the changes via the [git (Gist) sub-module](https://gist.github.com/mattfullerton/9156556).

##Do something
Improvements to the code and the data are welcome. Concerning the data, I am trying to reconcile our data with [this one](http://datahub.io/dataset/bangladesh-garment-industry-dataset/resource/d31e8265-5a75-4257-97c4-8a2cfd5d225b), based on data from the [ILRF](http://www.laborrights.org/). That's the kind of one-evening project where a second pair of eyes would be useful.

There are/were bigger projects dealing with documenting the garment industry:

- The first School of Data [Data Expedition on the topic](http://schoolofdata.org/data-expeditions/data-expedition-mapping-the-garment-factories/) resulted in [some nice work](http://www.annaflagg.com/work/garmentmapping/) mapping global supply chains.
- The second School of Data [Data Expedition on the topic](http://blog.okfn.org/2013/10/04/investigate-the-garment-factories-new-data-expedition/) (results [here](http://schoolofdata.org/2013/10/29/findings-of-the-investigation-of-garment-factories-of-bangladesh/)) included pooling together existing data and geocoding factory locations. The results in the form of a large data set can be found [on datahub](http://datahub.io/dataset/bangladesh-garment-industry-dataset), and a summary of what was done and what is left to do can be found on this [Trello board](https://trello.com/b/G0NNzqCx/bangladesh-garment-industry-database-and-mapping). Help is needed to finish things off, and find a way to keep the dataset up to date.
- [Free2Work](http://www.free2work.org/) is trying to show you the entire supply chain behind every barcode. It is a project supported by [ILRF](http://www.laborrights.org/). Their app allows you to contribute information on products.
