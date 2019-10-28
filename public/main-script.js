function toggleStreaming(connected, streaming) {
    if(connected == 'false') {
        $('#errorModalTitle').text('Errore');
        $('#errorModalContent').text('Connettere il client prima di iniziare lo streaming');
        $('#errorModal').modal('show');
    } else {
        if(streaming == 'true') {
            $('#streamingForm input[name=action]').val('stop');
        } else {
            $('#streamingForm input[name=action]').val('start');
        }

        $('#streamingForm').submit();
    }
};
