(function () {
    var loaded = false;
    function showError(message) {
        alert(message);
    }

    function setConnected(isConnected){
        var buttons = 'input[type="submit"], button';
        if( isConnected ){
            $(buttons).removeAttr('disabled', 'disabled');
        } else {
            $(buttons).attr('disabled', 'disabled');
        }

    }

    var server = {
        url: 'server/server.php',
        send: function (postDatas, successFunc) {
            $.ajax({
                type: 'POST',
                url: server.url,
                data: postDatas,
                dataType: 'json',
                success: function (retour) {
                    if (retour.type === 'OK') {
                        successFunc.call(null, retour.data);
                    } else {
                        showError(retour.message);
                    }
                }
            });
        },
        add: function (task, callback) {
            server.send({action: 'add', task: task}, function (data) {
                callback.call(null, data);
            });
        },
        remove: function (id, callback) {
            server.send({action: 'remove', id: id}, function (data) {
                callback.call(null, data);
            });
        },
        update: function (task, callback) {
            server.send({action: 'update', id: task.id, task:task.task}, function (data) {
                callback.call(null, data);
            });
        },
        list: function (callback) {
            server.send({action: 'list'}, function (data) {
                callback.call(null, data);
            });
        },
        reset: function (callback) {
            server.send({action: 'reset'}, function () {
                callback.call(null);
            });
        }
    };


    var tasks = {
        initEvents : function(element){
            element.find('span a').click(function (e) {
                e.stopPropagation();
                var id = element.attr('id');
                var taskId = $('#task_id').val();
                if( taskId === id){
                    tasks.resetForm();
                }
                server.remove(id , tasks.remove);
            });
            element.find('div').dblclick(function () {
                tasks.edit(this);
            });
        },
        resetForm:function(){
            $('#task').val('');
            $('#task_id').val(-1);
        },
        createTask: function (task) {
            var $li = $('<li id="' + task.id + '"><div>' + task.task + '</div><span><a href="#">delete</a></span></li>');
            $('#tasklist').append($li);
            tasks.initEvents($li);
            tasks.resetForm();

        },
        remove: function (id) {
            $('#' + id).remove();
        },
        edit: function (spanEl) {
            var $li = $(spanEl).parent().attr('id');
            var $taskElement =$('#task');
            $taskElement.val($(spanEl).text()).focus();
            $('#task_id').val($li);

            $li.remove();
        },
        replace:function(task){
            var $li = $('<li id="' + task.id + '"><div>' + task.task + '</div><span><a href="#">delete</a></span></li>');
            $('#'+task.id).replaceWith($li);
            tasks.initEvents($li);
            tasks.resetForm();
        }
    };


    function init(taskList) {
        $("#taskform").submit(function (e) {
            e.preventDefault();
            var task = $('#task').val();
            var taskId = $('#task_id').val();
            if (task !== '') {
                if (taskId == -1) {
                    server.add(task, tasks.createTask);
                } else {
                    server.update({id: taskId, task: task}, tasks.replace);
                }
            }
        });
        $('#reset').click(function () {
            server.reset(tasks.clear);
        });
        for (var i = 0; i < taskList.length; i++) {
            tasks.createTask(taskList[i]);
        }
        loaded=true;
    }

    if(navigator.onLine){
        // browser is online so i can load the list from the server
        server.list(init);
        // set the connection status to true
        setConnected(true);
    } else {
        // Not online, set the connection status to false
        setConnected(false);
    }

    $(window).bind('online', function(){
        // If the list was never loaded
        if( ! loaded ){
            // we load the list from the server
            server.list(init);
        }
        // set the connection status to true
        setConnected(true);
    });
    $(window).bind('offline', function(){
        // set the connection status to false
        setConnected(false);
    });
})();