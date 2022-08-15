# NodeJsServer

This is part of my Graduation project where we build a blockchain framework for cctv footage security 
# Part 1

In this repositry i cover the servers side of the framework
the API is for redirecting user to relevant request whether it is the the blockchain or the livefeed camera
![Picture2](https://user-images.githubusercontent.com/67503556/184701250-55949992-a8b8-49f8-a937-b6a3156070d7.jpg)
in the Above picture we have N number of proxy servers in the middle to redirect our different clients to the relevant area where the camera requested is present
I have created a ExpressJS server that is secured with https and is connected to a Hyperledger blockchain api and MongoDB database that has list of our users
our areas that contain cameras and data of each camera.
The API redirects us or gathers our info from the database

# Part 2
![Picture3](https://user-images.githubusercontent.com/67503556/184701252-8854cf26-27a4-427b-8413-83b1693a8949.png)
 in this picture we see our different users and that users have different access on different areas
 the Second server which is onPrem server is hosted on a onPremises server that is logically connected to multiple cameras and devices that gather the livefeed
 the server is connected to IPFS which is a p2p storage server that is decentralized allowing us to keep the blockchain's advantage of decentralization
 the server also has ffmpeg that we use to cut and edit our stored videos to deliver to user and stream to him in an encrypted manner

Please CheckOut my Other Repo of Blockchain CCTV for Hyperledger Fabric Setup
![Picture1](https://user-images.githubusercontent.com/67503556/184701244-c8223615-c991-48d7-8f3f-3208ca653497.png)
