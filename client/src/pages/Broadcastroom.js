import styled from "styled-components";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router";
import { toast } from "react-toastify";
import NoResults from "../components/Noresults";
import Connect from "../utils";
import { CircularProgress } from "@material-ui/core";
import ScreenShareIcon from '@material-ui/icons/ScreenShareOutlined';
import StopScreenShareIcon from '@material-ui/icons/StopScreenShareOutlined';
import VideocamIcon from '@material-ui/icons/Videocam';
import VideocamOffIcon from '@material-ui/icons/VideocamOff';
import MicIcon from '@material-ui/icons/Mic';
import MicOffIcon from '@material-ui/icons/MicOff';
import PeopleAltIcon from '@material-ui/icons/PeopleAlt';
import CallendIcon from '@material-ui/icons/CallEnd';

import { SocketContext } from "../utils/SocketContext";

const Broadcastroomwrapper = styled.div`
    position:absolute;
    top:0;
    bottom:0;
    color:white;
    right:0;
    left:0;
    z-index:300;
    background:${(props) => props.theme.bg};
    .loader{
        position:absolute;
        top:50%;
        left:50%;
    }
    .content{
        display:flex;
        margin:auto;
        flex-wrap:wrap;
        width:400px;
        margin-top:200px;
    }

    .controller {
        width: 300px;
        position: fixed;
        display: flex;
        flex-wrap: nowrap;
        left: calc(50% - 150px);
        justify-content: space-around;
        bottom: 20px;
    }
    .roundbtn {
        padding: 10px;
        background: #535151;
        border-radius: 100%;
        display: flex;
    }
    .onicon{
        fill:#0f0;
        font-size:30px;
    }
    .officon{
        fill:#f00;
        font-size:30px;
    }
    video{
        max-width:100%;
        max-height:100%;  
        margin:auto;
    }
    .broadcast_detail{
        text-align:center;
        margin:auto;   
        margin-top:200px;
        width:500px;
             
    }
    .avatardiv{
        margin:auto;
        width:60px;
        height:60px;
        margin-bottom:30px;
    }
    .videowrapper{
        width:100%;
        height:100%;
        display:flex;
    }
    .bold{
        font-weight:bold;
        font-size:18px;
        color:yellow;
    }
    .joinbtnround{
        background:#008000;
        padding:5px;
        cursor:pointer;
        border-radius:8px;
        width:100px;
        margin:auto;
        margin-top:30px;
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
    }
    h3>div{
        margin-bottom:10px;
    }
    h1{
        font-weight:bold;
        padding-bottom:20px;
    }


`;

const Broadcastroom = () => {
    const { roomid } = useParams();
    const [liveinfo, setLiveinfo] = useState({ title: "", description: "" });
    const [err, setErr] = useState(null);
    const [loading, setLoading] = useState(true);
    const [call, setCall] = useState(false);
    const [isVideoon, setVideoon] = useState(true);
    const [isMicon, setMicon] = useState(true);
    const [isScreensharing, setScreensharing] = useState(false);
    //configuration for webrtc ice servers


    const normalConstraints = {
        video: {
            facingMode: "user"
        },
        audio: true
    }
    const configuration = {
        iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "turn:numb.viagenie.ca", credential: "muazkh", username: "webrtc@live.com" },
            { urls: "turn:numb.viagenie.ca", credential: "1234567890", username: "leapkk58@gmail.com" },
        ],
    };
    const { Socket, setSocket } = React.useContext(SocketContext);
    const [disconnected, setDisconnected] = useState(false);
    const [chats, setChats] = useState([]);
    const [meetended,setMeetingended] = useState(true);

    const makeSocketConnection = () => {
        const token = localStorage.getItem("accesstoken");
        if (token) {
            if (Socket.connected)
                return;
            Socket.connect();
            setTimeout(makeSocketConnection, 1000);
            Socket.on("connect", () => {
                console.log("socket connect() fired");
                setSocket(Socket);
                //Socket.emit("joinliveroom",roomid);             
                // toast.success("Socket connected");
            })
            Socket.on("reconnect", () => {
                setSocket(Socket);
                console.log("socket reconnect() fired");
                disconnected && setTimeout(() => Socket.emit("joinliveroom", roomid), 1000);
                setDisconnected(false);
            })
            Socket.on('errmsg', function (err) {
                setCall(false);
                if (window.toastid) {
                    return;
                }
                window.toastid = toast.error(err);
                setTimeout(() => window.toastid = null, 3000);
            })

            Socket.on('disconnect', () => {
                //setSocket(null); 
                setDisconnected(true);
                console.log("socket disconnect() fired");
                setTimeout(makeSocketConnection, 1000);
            })
        }

    };
    useEffect(() => {
        makeSocketConnection();
        Connect("/user/getstreaminfo/" + roomid).then((d) => {
            setLoading(false);
            setLiveinfo(d.data);
            window.isOrganiser = d.data.isOrganiser;
        }).catch(err => {
            setLoading(false);
            toast.error(err.message);
            setErr(err.message);
        })
    }, []);

    useEffect(() => {
        window.peerConnections = {};
        Socket.on("broadcaster", function (id) {
            if (!window.isOrganiser) {

                Socket.emit("watcher")
            }
        });
        Socket.on("offer", async (id, me, description) => {
            if (!window.call || window.isOrganiser) {
                return;
            }
            window.peerConnection = new RTCPeerConnection(configuration);
            window.peerConnection.ontrack = (event) => {
                console.log("Track--->" + JSON.stringify(event));
                //window.stream = event.streams[0];               

                if (event.streams && event.streams[0]) {
                    //videoElem.srcObject = ev.streams[0];
                    window.stream = event.streams[0];
                    document.getElementById("video") && (document.getElementById("video").srcObject = event.streams[0]);
                } else {
                    if (!window.stream) {
                        window.stream = new MediaStream();
                        document.getElementById("video") && (document.getElementById("video").srcObject = window.stream);
                    }
                    window.stream.addTrack(event.track);
                }
                //alert("ontrack");
            };
            window.peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    Socket.emit("candidate", id, Socket.id, event.candidate);
                }
            };
            setTimeout(async () => {
                await window.peerConnection.setRemoteDescription(new RTCSessionDescription(description)); await window.peerConnection.createAnswer().then(async function (sdp) {
                    await window.peerConnection.setLocalDescription(new RTCSessionDescription(sdp));
                    Socket.emit("answer", id, Socket.id, sdp);
                });
                console.log("offer to watcher");
            }, 1000)


            // window.peerConnection.addTrack(null,null);
        });
        Socket.on("disconnectPeer", id => {
            if (window.isOrganiser) {
                if (window.peerConnections[id]) {
                    window.peerConnections[id]?.close();
                    delete window.peerConnections[id];
                }
            }
            else {
                window.peerConnection?.close();
            }
        });
        window.onunload = window.onbeforeunload = () => {
            Socket.close();
        };
        Socket.on("watcher", async (id) => {

            console.log("watcher event reached");
            if (!window.call) return;
            if (!window.isOrganiser) return;
            console.log("watcher event passed");
            const peerConnection = new RTCPeerConnection(configuration);
            window.peerConnections[id] = peerConnection;


            peerConnection.ontrack = ev => {
                console.log("Track event called for watcher");
            }
            peerConnection.oniceconnectionstatechange = async function() {
                if(peerConnection.iceConnectionState==="disconnected"||peerConnection.iceConnectionState==="failed")
                await peerConnection
                .createOffer({ iceRestart: true })
                .then(async function (sdp) {
                    await peerConnection.setLocalDescription(new RTCSessionDescription(sdp));
                    Socket.emit("offer", id, Socket.id, sdp);
                }).catch(e=>console.log(e));                
                
              }
            peerConnection.onicecandidate = event => {
                if (event.candidate) {
                    Socket.emit("candidate", id, Socket.id, { sdpMLineIndex: event.candidate.sdpMLineIndex, candidate: event.candidate.candidate });
                }
            };
            window.stream.getTracks().forEach(function (track) { peerConnection.addTrack(track) });

            await peerConnection
                .createOffer({ iceRestart: true })
                .then(async function (sdp) {
                    await peerConnection.setLocalDescription(new RTCSessionDescription(sdp));
                    Socket.emit("offer", id, Socket.id, sdp);
                }).catch(e=>console.log(e));    
        });

        Socket.on("answer", function (id, description) {
            if (window.isOrganiser) {
                console.log("answer to broadcaster");
                window.peerConnections[id].setRemoteDescription(description);
            }
        });

        Socket.on("candidate", function (id, me, candidate) {
            if (window.isOrganiser) {
                window.peerConnections[id].addIceCandidate(new RTCIceCandidate(candidate));
            }
            else {
                window.peerConnection.addIceCandidate(new RTCIceCandidate(candidate))
            }
        });

        Socket.on("msgchat", function (data) {
            setChats([...chats, data]);
        });
        Socket.on("meetingended",function(){
            setMeetingended(true);
        })
        return () => {
            Socket.close();
        }
    }, [])

    const joinLiveEvent = () => {
        setCall(true);
        window.call = true;
        Socket.emit("joinliveroom", roomid)
        window.isOrganiser && navigator.mediaDevices
            .getUserMedia(normalConstraints)
            .then(stream => {
                window.stream = stream;
                document.getElementById("video") && (document.getElementById("video").srcObject = stream);
                Socket.emit("broadcaster");
            })
            .catch(error => { setErr(error.message) });
        if (!window.isOrganiser) {
            setTimeout(() => Socket.emit("watcher"), 1000);
        }

    }

    const CameraAction = () => {
        window.stream.getVideoTracks().forEach(function (t) {
            t.enabled = !isVideoon;
        })
        setVideoon(!isVideoon);
    }

    const MicAction = () => {
        window.stream.getAudioTracks().forEach(function (t) {
            t.enabled = !isMicon;
        })
        setMicon(!isMicon);
    }

    const ScreenShareAction = async () => {
        console.log(window.peerConnections);
        const peers = window.peerConnections||{};
        let x;
        const ww = isScreensharing;
        if (!isScreensharing)
            try {
                let e = await navigator.mediaDevices.getDisplayMedia({ video: { cursor: "always" }}),
                    i = e.getVideoTracks()[0];
                for (x in peers) {                    
                    peers[x]
                        .getSenders()
                        .find(function (e) {
                            return e.track.kind == i.kind;
                        })
                        .replaceTrack(i);
                }
                window.stream.removeTrack(window.stream.getVideoTracks()[0]);
                window.stream.getVideoTracks().forEach((e) => e.stop());
                i.enabled = isVideoon;
                window.stream.addTrack(i);
                setScreensharing(!ww);
                document.getElementById("video").srcObject = window.stream;

            } catch (e) {
                toast.error(e.message);
                setScreensharing(ww);
                    navigator.mediaDevices
                        .getUserMedia(normalConstraints)
                        .then(function (e) {

                            let i = e.getVideoTracks()[0],
                                s = e.getAudioTracks()[0];
                            i.enabled = isVideoon;
                            s.enabled = isMicon;
                            for (x in peers) {
                                var t = peers[x].getSenders().find(function (e) {
                                    return e.track.kind == i.kind;
                                }),
                                    a = peers[x].getSenders().find(function (e) {
                                        return e.track.kind == s.kind;
                                    });
                            t.replaceTrack(i);
                            a.replaceTrack(s);
                            }
                            window.stream.getTracks().forEach((e) => e.stop());
                            window.stream = e;
                            document.getElementById("video").srcObject = window.stream;
                        })
                        .catch((e) => toast.error(e.message));
            }
        else {
            navigator.mediaDevices
                .getUserMedia({ video: !0, audio: !0 })
                .then(function (e) {
                    let i = e.getVideoTracks()[0],
                        s = e.getAudioTracks()[0];
                    i.enabled = isVideoon;
                    s.enabled = isMicon;
                    setScreensharing(!ww);
                    for (x in peers) {
                        var t = peers[x].getSenders().find(function (e) {
                            return e.track.kind == i.kind;
                        }),
                            a = peers[x].getSenders().find(function (e) {
                                return e.track.kind == s.kind;
                            });
                        t.replaceTrack(i);
                        a.replaceTrack(s);
                    }
                    window.stream.getTracks().forEach((e) => e.stop());
                        window.stream = e;
                        document.getElementById("video").srcObject = window.stream;

                })
                .catch((e) => console.log(e.message));
        }
    }
    const CallEndAction = () => {
        
        if (window.confirm("This will delete all data of this live event from server.Are you sure?")) {
            console.log("Ending...");
            Socket.emit("endmeeting");
            //window.location.replace("/");
        }
    }


    if (loading) {
        return <Broadcastroomwrapper>
            <div className="loader">
                <CircularProgress size={32} />
            </div>
        </Broadcastroomwrapper>
    }
    if(meetended){
        return <Broadcastroomwrapper>
            <div className="content">
                <h1>The event has ended now</h1>
                <div className="joinbtnround" style={{width:"130px",marginTop:0}} onClick={()=>window.location.replace("/user/startlive")}>Create event</div>
            </div>
        </Broadcastroomwrapper>
    }
    if (err) {
        return <Broadcastroomwrapper>
            <NoResults center={true} title="Failed to load data" text={err} />
        </Broadcastroomwrapper>
    }
    if (liveinfo) {
        return <Broadcastroomwrapper>
            {!call ? <div className="broadcast_detail">
                <h1>Online live broadcasting</h1>
                <h3 style={{ color: "blue", fontWeight: "bold" }} title={liveinfo?.title}>{liveinfo.title.length > 30 ? liveinfo.title.substring(0, 30) + "..." : liveinfo.title}</h3>

                <div><span className="bold">Organiser: </span>{liveinfo.organiser}</div>
                <div title={liveinfo?.description}><span className="bold">Description: </span>{liveinfo.description.length > 50 ? liveinfo.description.substring(0, 50) + "..." : liveinfo.description}</div>
                <div><span className="bold">Total participants: </span>{liveinfo.total}</div>
                <div className="joinbtnround" onClick={joinLiveEvent}>Join Now</div>
            </div> : <div className="videowrapper"><video id="video" autoPlay muted={window.isOrganiser}></video>{liveinfo.isOrganiser && <div className="controller">
                <div className="roundbtn" onClick={ScreenShareAction}>{isScreensharing ? <StopScreenShareIcon className="officon" /> : <ScreenShareIcon className="onicon" />}</div>
                <div className="roundbtn" onClick={CameraAction}>{isVideoon ? <VideocamIcon className="onicon" /> : <VideocamOffIcon className="officon" />}</div>
                <div className="roundbtn" onClick={MicAction}>{isMicon ? <MicIcon className="onicon" /> : <MicOffIcon className="officon" />}</div>
                <div className="roundbtn" onClick={CallEndAction}><CallendIcon className="officon" /></div>
            </div>}
            </div>}
        </Broadcastroomwrapper>
    }

}


export default Broadcastroom;