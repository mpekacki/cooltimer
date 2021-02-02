(this.webpackJsonptimer=this.webpackJsonptimer||[]).push([[0],{17:function(t,e,a){t.exports=a(36)},22:function(t,e,a){},31:function(t,e,a){},36:function(t,e,a){"use strict";a.r(e);var n=a(1),s=a.n(n),r=a(7),i=a.n(r),o=(a(22),a(13)),c=a(2),l=a(3),u=a(5),m=a(4),k=a(6),d=a(12),h=(a(31),function(t){function e(t){var a;return Object(c.a)(this,e),(a=Object(u.a)(this,Object(m.a)(e).call(this,t))).componentWillReceiveProps=function(t){a.setState(t)},a.onChangeWorkMinutes=function(t){a.onchange({workMinutes:t.target.value})},a.onChangeShortBreakMinutes=function(t){a.onchange({shortBreakMinutes:t.target.value})},a.onChangeLongBreakMinutes=function(t){a.onchange({longBreakMinutes:t.target.value})},a.onChangeLongBreakFreq=function(t){a.onchange({longBreakFreq:t.target.value})},a.state={workMinutes:t.workMinutes,shortBreakMinutes:t.shortBreakMinutes,longBreakMinutes:t.longBreakMinutes,longBreakFreq:t.longBreakFreq},a.onchange=t.onchange,a}return Object(k.a)(e,t),Object(l.a)(e,[{key:"render",value:function(){return s.a.createElement("div",null,s.a.createElement("div",{class:"d-flex flex-row form-group"},s.a.createElement("label",{for:"work-minutes",class:"p-2 col-form-label"},"Work cycle minutes"),s.a.createElement("div",{class:"p-2"},s.a.createElement("input",{class:"form-control",type:"number",value:this.state.workMinutes,onChange:this.onChangeWorkMinutes,id:"work-minutes"}))),s.a.createElement("div",{class:"d-flex flex-row form-group"},s.a.createElement("label",{for:"short-break-minutes",class:"p-2 col-form-label"},"Short break minutes"),s.a.createElement("div",{class:"p-2"},s.a.createElement("input",{class:"form-control",type:"number",value:this.state.shortBreakMinutes,onChange:this.onChangeShortBreakMinutes,id:"short-break-minutes"}))),s.a.createElement("div",{class:"d-flex flex-row form-group"},s.a.createElement("label",{for:"long-break-minutes",class:"p-2 col-form-label"},"Long break minutes"),s.a.createElement("div",{class:"p-2"},s.a.createElement("input",{class:"form-control",type:"number",value:this.state.longBreakMinutes,onChange:this.onChangeLongBreakMinutes,id:"long-break-minutes"}))),s.a.createElement("div",{class:"d-flex flex-row form-group"},s.a.createElement("label",{for:"long-break-freq",class:"p-2 col-form-label"},"Long break after n cycles"),s.a.createElement("div",{class:"p-2"},s.a.createElement("input",{class:"form-control",type:"number",value:this.state.longBreakFreq,onChange:this.onChangeLongBreakFreq,id:"long-break-freq"}))))}}]),e}(s.a.Component)),g=a(16),f=function(t){function e(t){var a;return Object(c.a)(this,e),(a=Object(u.a)(this,Object(m.a)(e).call(this,t))).onClickStartWorking=function(){a.setStateAndStorage({isWork:!0,timerRunning:!0}),a.markTimerStart()},a.onClickReturnToWork=function(){a.setStateAndStorage({isWork:!0,timerSeconds:60*a.state.workMinutes})},a.onClickGoOnABreak=function(){var t=Math.round(a.state.availableBreakSeconds);a.setStateAndStorage({isWork:!1,timerSeconds:t,availableBreakSeconds:t}),a.markTimerStart()},a.markTimerStart=function(){a.timerStartedAt=Date.now()},a.tick=function(){if(a.state.timerRunning){var t=Date.now(),e=Math.round((t-a.state.timerLastUpdatedAt)/1e3);a.tempState=a.state;for(var n=e;n>0;n--){if(a.tempState.timerSeconds--,a.tempState.isWork){a.tempState.totalWorkedSeconds++;var s=1*a.state.shortBreakMinutes/a.state.workMinutes;a.tempState.availableBreakSeconds>=60*a.state.shortBreakMinutes?a.tempState.availableBreakSeconds+=s:a.tempState.hiddenAvailableBreakSeconds+=s}else a.tempState.availableBreakSeconds--;a.tempState.timerLastUpdatedAt=t,0===a.tempState.timerSeconds&&a.onTimerFinish()}a.setStateAndStorage(a.tempState)}else a.setStateAndStorage({timerLastUpdatedAt:Date.now()})},a.onTimerFinish=function(){var t=a.tempState.isWork,e={};if(t){var n,s,r=a.tempState.cycle+1,i=a.tempState.availableBreakSeconds;r===a.state.longBreakFreq&&(r=0,i+=60*a.state.longBreakMinutes-60*a.state.shortBreakMinutes),i+=a.tempState.hiddenAvailableBreakSeconds,i=Math.round(i),a.tempState.continousWork?(n=60*a.state.workMinutes,s=!0):(n=i,s=!1),e={timerSeconds:n,availableBreakSeconds:i,hiddenAvailableBreakSeconds:0,isWork:s,cycle:r}}else e={timerSeconds:60*a.state.workMinutes,isWork:!0};e.timerRunning=a.state.autoStartTimers,a.tempState=Object.assign(a.tempState,e),a.props.showNotification(t?"Work finished":"Break finished"),a.props.onTimerFinish({wasWork:t,startedAt:a.timerStartedAt}),a.markTimerStart()},a.onClickHoldWork=function(){a.setStateAndStorage({timerRunning:!1})},a.onClickResumeWork=function(){a.setStateAndStorage({timerRunning:!0})},a.onChangeContinousWork=function(t){a.setStateAndStorage({continousWork:t.target.checked})},a.onChangeAutoStartTimers=function(t){a.setStateAndStorage({autoStartTimers:t.target.checked})},a.setStateAndStorage=function(t){a.setState(t),a.props.setStateAndStorage(t)},a.state=Object(g.a)({},t),setInterval(a.tick,1e3),a.tick(),a}return Object(k.a)(e,t),Object(l.a)(e,[{key:"componentWillReceiveProps",value:function(t){this.setState(t)}},{key:"formatSecondsAsTimer",value:function(t){return String(Math.floor(t/60)).padStart(2,"0")+":"+String(t%60).padStart(2,"0")}},{key:"formatSecondsAsText",value:function(t){t=Math.round(t);var e=Math.floor(t/3600)+"",a="1"===e?"hour":"hours";t%=3600;var n=Math.floor(t/60)+"",s=(t%=60)%60+"";return e+" "+a+" "+n+" "+("1"===n?"minute":"minutes")+" "+s+" "+("1"===s?"second":"seconds")}},{key:"render",value:function(){return s.a.createElement("div",null,s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm"},!0===this.state.timerRunning&&s.a.createElement("button",{className:"btn btn-warning",onClick:this.onClickHoldWork},"Hold work"),!1===this.state.timerRunning&&s.a.createElement("button",{className:"btn btn-secondary",onClick:this.onClickResumeWork,"data-testid":"resume-work-btn"},"Resume work"),null===this.state.isWork&&s.a.createElement("button",{className:"btn btn-success",onClick:this.onClickStartWorking,"data-testid":"start-working-btn"},"Start working"))),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm"},s.a.createElement("h1",{"data-testid":"timer"},this.formatSecondsAsTimer(this.state.timerSeconds)))),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm"},!0===this.state.isWork&&this.state.availableBreakSeconds?s.a.createElement(s.a.Fragment,null,s.a.createElement("button",{className:"btn btn-success",onClick:this.onClickGoOnABreak},"Go on a break")):null,!1===this.state.isWork?s.a.createElement(s.a.Fragment,null,s.a.createElement("button",{className:"btn btn-secondary",onClick:this.onClickReturnToWork},"Return to work")):null)),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm font-weight-light text-md-right"},"Total time worked:"),s.a.createElement("div",{class:"col-sm text-md-left","data-testid":"totalWorkedTime"},this.formatSecondsAsText(this.state.totalWorkedSeconds))),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm font-weight-light text-md-right"},"Available break time:"),s.a.createElement("div",{class:"col-sm text-md-left","data-testid":"availableBreakTime"},this.formatSecondsAsText(this.state.availableBreakSeconds))),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm font-weight-light text-md-right"},"Cycles until long break (",this.state.longBreakMinutes," minutes):"),s.a.createElement("div",{class:"col-sm text-md-left","data-testid":"longBreakInfo"},this.cyclesUntilLongBreak)),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm"},s.a.createElement("div",{class:"form-check"},s.a.createElement("input",{class:"form-check-input",type:"checkbox",value:"",onChange:this.onChangeContinousWork,checked:this.state.continousWork,"data-testid":"cont-work",id:"cont-work-check"}),s.a.createElement("label",{class:"form-check-label",htmlFor:"cont-work-check"},"Continuous work")))),s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm"},s.a.createElement("div",{class:"form-check"},s.a.createElement("input",{class:"form-check-input",type:"checkbox",value:"",onChange:this.onChangeAutoStartTimers,checked:this.state.autoStartTimers,"data-testid":"auto-start-timers",id:"auto-start-timers-check"}),s.a.createElement("label",{class:"form-check-label",htmlFor:"auto-start-timers-check"},"Start timers automatically")))))}},{key:"cyclesUntilLongBreak",get:function(){return this.state.longBreakFreq-this.state.cycle}}]),e}(s.a.Component),S=a(14),b=a(10),p=a(8),v=a(15),B=function(t){function e(t){var a;return Object(c.a)(this,e),(a=Object(u.a)(this,Object(m.a)(e).call(this,t))).onClickReset=function(){window.confirm("Are you sure you want to reset everything to inital state?")&&a.setStateAndStorage(a.getDefaultStateWithoutSettings())},a.onClickSettings=function(){a.setState({settingsVisible:!a.state.settingsVisible})},a.setStateAndStorage=function(t){a.setState(t),a.storage&&(a.storage.state=Object.assign(a.state,t))},a.onChangeSettings=function(t){a.setStateAndStorage(t)},a.getDefaultState=function(){return{timerSeconds:60*a.defaultSettings.workMinutes,totalWorkedSeconds:0,isWork:null,availableBreakSeconds:0,hiddenAvailableBreakSeconds:0,cycle:0,notificationsGranted:!1,timerRunning:null,continousWork:!1,timerLastUpdatedAt:Date.now(),autoStartTimers:!0,workMinutes:a.defaultSettings.workMinutes,shortBreakMinutes:a.defaultSettings.shortBreakMinutes,longBreakMinutes:a.defaultSettings.longBreakMinutes,longBreakFreq:a.defaultSettings.longBreakFreq,settingsVisible:!1,events:[]}},a.getDefaultStateWithoutSettings=function(){var t=a.getDefaultState();return t.continousWork=a.state.continousWork,t.autoStartTimers=a.state.autoStartTimers,t.workMinutes=a.state.workMinutes,t.shortBreakMinutes=a.state.shortBreakMinutes,t.longBreakMinutes=a.state.longBreakMinutes,t.longBreakFreq=a.state.longBreakFreq,t.timerSeconds=60*a.state.workMinutes,t},a.handleTimerStateChange=function(t){a.setStateAndStorage(t)},a.handleShowNotification=function(t){a.notifications&&a.notificationsGranted&&a.notifications.createNotification(t)},a.handleTimerFinish=function(t){a.setStateAndStorage({events:[].concat(Object(o.a)(a.state.events),[{title:t.wasWork?"Work":"Break",start:new Date(t.startedAt),end:new Date(Date.now())}])})},a.defaultSettings=t.defaultSettings,a.storage=t.storage,a.state=a.getDefaultState(),a.storage&&a.storage.state&&(a.state=Object.assign(a.state,a.storage.state)),t.notifications&&(a.notifications=t.notifications,a.notifications.requestPermission().then((function(t){"granted"===t&&(a.notificationsGranted=!0)}))),a.plugins=[b.a],a}return Object(k.a)(e,t),Object(l.a)(e,[{key:"render",value:function(){return s.a.createElement("div",{className:"App"},s.a.createElement(d.Helmet,null,s.a.createElement("title",null,"Timer")),s.a.createElement("link",{rel:"stylesheet",href:"https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/css/bootstrap.min.css",integrity:"sha384-ggOyR0iXCbMQv3Xipma34MD+dH/1fQ784/j6cY/iJTQUOhcWr7x9JvoRxT2MZw1T",crossorigin:"anonymous"}),s.a.createElement("script",{src:"https://code.jquery.com/jquery-3.3.1.slim.min.js",integrity:"sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo",crossorigin:"anonymous"}),s.a.createElement("script",{src:"https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.7/umd/popper.min.js",integrity:"sha384-UO2eT0CpHqdSJQ6hJty5KVphtPhzWj9WO1clHTMGa3JDZwrnQq4sF86dIHNDz0W1",crossorigin:"anonymous"}),s.a.createElement("script",{src:"https://stackpath.bootstrapcdn.com/bootstrap/4.3.1/js/bootstrap.min.js",integrity:"sha384-JjSmVgyd0p3pXB1rRibZUAYoIIy6OrQ6VrjIEaFf/nJGzIxFDsf4x0xIM+B07jRM",crossorigin:"anonymous"}),s.a.createElement("div",{class:"container"},s.a.createElement("div",{class:"row"},s.a.createElement("div",{class:"col-sm offset-sm-11"},s.a.createElement("button",{className:"btn",onClick:this.onClickReset,"data-testid":"reset-btn"},"Reset"))),s.a.createElement(f,{timerSeconds:this.state.timerSeconds,totalWorkedSeconds:this.state.totalWorkedSeconds,isWork:this.state.isWork,availableBreakSeconds:this.state.availableBreakSeconds,hiddenAvailableBreakSeconds:this.state.hiddenAvailableBreakSeconds,cycle:this.state.cycle,timerRunning:this.state.timerRunning,continousWork:this.state.continousWork,timerLastUpdatedAt:this.state.timerLastUpdatedAt,autoStartTimers:this.state.autoStartTimers,workMinutes:this.state.workMinutes,shortBreakMinutes:this.state.shortBreakMinutes,longBreakMinutes:this.state.longBreakMinutes,longBreakFreq:this.state.longBreakFreq,setStateAndStorage:this.handleTimerStateChange,showNotification:this.handleShowNotification,onTimerFinish:this.handleTimerFinish}),s.a.createElement("button",{class:"btn m-2",type:"button",onClick:this.onClickSettings},"Settings"),s.a.createElement("div",{class:this.state.settingsVisible?"collapse show":"collapse"},s.a.createElement("div",{class:"card card-body"},s.a.createElement(h,{workMinutes:this.state.workMinutes,shortBreakMinutes:this.state.shortBreakMinutes,longBreakMinutes:this.state.longBreakMinutes,longBreakFreq:this.state.longBreakFreq,onchange:this.onChangeSettings}))),s.a.createElement("div",{class:"card card-body"},s.a.createElement(S.a,{events:this.state.events,plugins:[b.a,p.b,v.a],initialView:"timeGridWeek",headerToolbar:{right:"today prev,next dayGridMonth,timeGridWeek,timeGridDay listWeek"}}))))}}]),e}(s.a.Component);Boolean("localhost"===window.location.hostname||"[::1]"===window.location.hostname||window.location.hostname.match(/^127(?:\.(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)){3}$/));var w=function(t){function e(){return Object(c.a)(this,e),Object(u.a)(this,Object(m.a)(e).call(this,25,5,10,4,480))}return Object(k.a)(e,t),e}(function(){function t(e,a,n,s){Object(c.a)(this,t),this._workMinutes=e,this._shortBreakMinutes=a,this._longBreakMinutes=n,this._longBreakFreq=s}return Object(l.a)(t,[{key:"workMinutes",get:function(){return this._workMinutes}},{key:"shortBreakMinutes",get:function(){return this._shortBreakMinutes}},{key:"longBreakMinutes",get:function(){return this._longBreakMinutes}},{key:"longBreakFreq",get:function(){return this._longBreakFreq}}]),t}()),M=function(){function t(){Object(c.a)(this,t)}return Object(l.a)(t,[{key:"requestPermission",value:function(){return Notification.requestPermission()}},{key:"createNotification",value:function(t,e){new Notification(t,e)}}]),t}(),E=function(){function t(){Object(c.a)(this,t)}return Object(l.a)(t,[{key:"state",get:function(){return JSON.parse(localStorage.getItem("timer_state"))},set:function(t){localStorage.setItem("timer_state",JSON.stringify(t))}}]),t}();i.a.render(s.a.createElement(B,{basename:"/cooltimer",defaultSettings:new w,notifications:new M,storage:new E}),document.getElementById("root")),"serviceWorker"in navigator&&navigator.serviceWorker.ready.then((function(t){t.unregister()}))}},[[17,1,2]]]);
//# sourceMappingURL=main.156ad75d.chunk.js.map