Licence: This project is licenced under Jerm Technology (www.jermtechnology.com)
Serving: Either compile the projct with phonegap to create Windows,Android and IOS mobile apps or serve with twisted;
         $ twistd -n web --path [PATH-TO]/JMS-Phonegap -p [PORT]
         NB: 
            - if served with twisted, please edit the redirection-url in JMS-Remote/index.html accordingly
            - to install twisted; 
                $ sudo apt-get install python-twisted-core

Flask(logic)-Server:
    $ python server.py

NOTE: 1) start both flask and twisted servers to be on safe side. 
      2) compile both JMS-Phonegap and JMS-Remote projects such that both families of apps are present
         -> JMS-Phonegap: all html,js and css files are bundled into the app. As a result, its faster
                          but it needs updating whenever there is a change in the project
         -> JMS-Remote: only contains an index.html fil which redirects to the index file served
                        by the remote twisted server. Its slower as all pages are loaded remotely but
                        it only needs to be installed once as all updates made to the project are
                        effected emmediately the user accesses the remote files!
