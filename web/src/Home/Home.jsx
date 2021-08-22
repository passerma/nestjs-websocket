import React from 'react';
import { Comment, Statistic, Avatar, Input, message } from 'antd';
import './Home.css';
import io from "socket.io-client"

export default class Home extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: [],
            inputValue: '',
            Online: 0,
            History: 0
        };
        this.name = ''
    }
    componentDidMount() {
        this.socket = io('ws://127.0.0.1:7956',{path: '/socket' ,});
        this.socket.on('enter', this.enterRoom);
        this.socket.on('enterName', this.enterNameRoom);
        this.socket.on('message', this.messageRoom);
        this.socket.on('name', this.nameRoom);
        this.socket.on('leave', this.leaveRoom);
    }

    componentDidUpdate() {
        this.refs.home.scrollTop = this.refs.home.scrollHeight;
    }

    /** 
     * 进入
    */
    enterRoom = (data) => {
        let { list } = this.state
        list.push({
            type: 'enter',
            name: data.name
        })
        this.setState({
            list: list,
            Online: data.allNum,
            History: data.connectCounts
        })
    }

    /** 
     * 进入修改自己的名称
    */
    enterNameRoom = (name) => {
        console.log(name)
        this.name = name
    }

    /** 
     * 接收消息
    */
    messageRoom = (data) => {
        let { list } = this.state
        list.push({
            type: 'message',
            say: data.say,
            name: data.name
        })
        this.setState({
            list: list
        })
    }

    /** 
     * 修改名称
    */
    nameRoom = (name) => {
        this.name = name
        message.success(`成功修改名称为${name}`)
    }

    /** 
     * 离开
    */
    leaveRoom = (data) => {
        let { list } = this.state
        list.push({
            type: 'leave',
            name: data.name
        })
        this.setState({
            list: list,
            Online: data.allNum,
            History: data.connectCounts
        })
    }

    sentChange = (value) => {
        this.setState({
            inputValue: value.currentTarget.value
        })
    }
    onSearch = (value) => {
        if (value) {
            this.socket.emit('message', value)
            this.setState({
                inputValue: ''
            })
        }
    }
    onChange = (value) => {
        if (value) {
            this.socket.emit('name', value)
        }
    }
    render() {
        let { list, inputValue, Online, History } = this.state
        return (
            <div className="Home" ref="home">
                <Statistic style={{ padding: '10px 20px', display: 'inline-block' }} title="Online Users" value={Online} />
                <Statistic style={{ padding: '10px 20px', display: 'inline-block' }} title="History Users" value={History} />
                {
                    list.map((value, index) => {
                        if (value.type === 'enter') {
                            return <div className="home-enter" key={index}>
                                <span className="home-enter-name">{value.name}加入聊天室</span>
                            </div>
                        }
                        if (value.type === 'message' && value.name !== this.name) {
                            return <Comment
                                style={{ padding: '0 20px' }}
                                key={index}
                                author={<sapn>{value.name}</sapn>}
                                avatar={
                                    <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
                                }
                                content={
                                    <p>{value.say}</p>
                                }
                            />
                        }
                        if (value.type === 'message' && value.name === this.name) {
                            return <div className="ant-comment" style={{ padding: '0px 20px' }} key={index}>
                                <div className="ant-comment-inner">
                                    <div className="ant-comment-content">
                                        <div className="ant-comment-content-author" style={{ textAlign: 'right' }}>
                                            <span className="ant-comment-content-author-name" style={{ display: 'inline-block', width: '100%' }}>
                                                <sapn>{value.name}</sapn>
                                            </span>
                                        </div>
                                        <div className="ant-comment-content-detail">
                                            <p style={{ textAlign: 'right' }}>{value.say}</p>
                                        </div>
                                    </div>
                                    <div className="ant-comment-avatar" style={{ margin: '0 0 0 12px' }}>
                                        <Avatar style={{ backgroundColor: '#87d068' }} icon="user" />
                                    </div>
                                </div>
                            </div>
                        }
                        if (value.type === 'leave') {
                            return <div className="home-enter" key={index}>
                                <span className="home-enter-name">{value.name}离开了聊天室</span>
                            </div>
                        }
                    })
                }
                <div className="input-wrap">
                    <Input.Search className="sentName" enterButton={'更换昵称'} onSearch={this.onChange} />
                    <Input.Search value={inputValue} onChange={this.sentChange} className="sentInput" enterButton={'发送'}
                        onSearch={this.onSearch} />
                </div>
            </div>
        );
    }
}

