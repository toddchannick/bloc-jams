var playButtonTemplate = '<a class="album-song-button"><span class="ion-play"></span></a>';
var pauseButtonTemplate = '<a class="album-song-button"><span class="ion-pause"></span></a>';
var playerBarPlayButton = '<span class="ion-play"></span>';
var playerBarPauseButton = '<span class="ion-pause"></span>';

var currentlyPlayingSongNumber = null;
var currentSongFromAlbum = null;
var currentSoundFile = null;
var currentVolume = 80;
var currentAlbum = null;

var $previousButton = $('.main-controls .previous');
var $nextButton = $('.main-controls .next');
var $playPauseButton = $('.main-controls .play-pause');

$(document).ready(function() {
  setCurrentAlbum(albumPicasso); 
  setupSeekBars();
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
  $playPauseButton.click(togglePlayFromPlayerBar);
});

//functions defined below//

var createSongRow = function (songNumber, songName, songLength) {
  var template =
       '<tr class="album-view-song-item">'
   + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
   + '  <td class="song-item-title">' + songName + '</td>'
   + '  <td class="song-item-duration">' + filterTimeCode(songLength) + '</td>'
   + '</tr>'
  ;

  var $row = $(template);
  
  var clickHandler = function(){
    var songNumber = parseInt($(this).attr('data-song-number'));
    
    if (currentlyPlayingSongNumber !== null) {
      var currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
      currentlyPlayingCell.html(currentlyPlayingSongNumber);
    }
    if (currentlyPlayingSongNumber !== songNumber) {
      $(this).html(pauseButtonTemplate);
      setSong(songNumber);
      currentSoundFile.play();
      updateSeekBarWhileSongPlays();
      
      var $volumeFill = $('.volume .fill');
      var $volumeThumb = $('.volume .thumb');
      $volumeFill.width(currentVolume + '%');
      $volumeThumb.css({left: currentVolume + '%'});
      
      updatePlayerBarSong();
    } 
    else if (currentlyPlayingSongNumber === songNumber) {
      $(this).html(playButtonTemplate);
      $('.main-controls .play-pause').html(playerBarPlayButton);
      currentlyPlayingSongNumber = null;
      currentSongFromAlbum = null;
      
      if (!currentSoundFile.isPaused()){
        currentSoundFile.pause();
      }
    }
  };
  
  var onHover = function(event) {
    
    var songNumLocation = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumLocation.attr('data-song-number'));
    
    if (songNumber !== currentlyPlayingSongNumber) {
      songNumLocation.html(playButtonTemplate);
    }
      
  };
  
  var offHover = function(event) {
    
    var songNumLocation = $(this).find('.song-item-number');
    var songNumber = parseInt(songNumLocation.attr('data-song-number'));
    
    if (songNumber !== currentlyPlayingSongNumber) {
      songNumLocation.html(songNumber);
    }
    
  }; 
  
  $row.find('.song-item-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
  
};

var setCurrentAlbum = function (album) {
  currentAlbum = album;
  
  var $albumTitle = $('.album-view-title');
  var $albumArtist = $('.album-view-artist');
  var $albumReleaseInfo = $('.album-view-release-info');
  var $albumImage = $('.album-cover-art');
  var $albumSongList = $('.album-view-song-list');
  
  $albumTitle.text(album.name);
  $albumArtist.text(album.artist);
  $albumReleaseInfo.text(album.year + ' ' + album.label);
  $albumImage.attr('src', album.albumArtUrl);

  $albumSongList.empty();

  for (i = 0; i < album.songs.length; i++) {
    var $newRow = createSongRow(i + 1, album.songs[i].name, album.songs[i].length);
    $albumSongList.append($newRow);
  }
};

var setSong = function (songNumber) {
  
  //prevents concurrent playback...if a song is currently playing (true), then stop it when setSong is called//
  if (currentSoundFile) {
    currentSoundFile.stop();
  }
  
  currentlyPlayingSongNumber = parseInt(songNumber); 
  currentSongFromAlbum = currentAlbum.songs[songNumber - 1];
  
  currentSoundFile = new buzz.sound(currentSongFromAlbum.audioUrl, {
    formats: [ 'mp3' ],
    preload: true
   });
  
  setVolume(currentVolume);
};

var setVolume = function(volume){
  if(currentSoundFile){
    currentSoundFile.setVolume(volume);
  }
};

var togglePlayFromPlayerBar = function(){
  var $currentlyPlayingCell = getSongNumberCell(currentlyPlayingSongNumber);
  if(currentSoundFile && currentSoundFile.isPaused()){
    // Update play/pause button in cell 
    $currentlyPlayingCell.html(pauseButtonTemplate);
    // Update play/pause button in player bar using $(this) - the clicked element
    $(this).html(playerBarPauseButton);
    currentSoundFile.play();   
  }
  else if (currentSoundFile) {
    $currentlyPlayingCell.html(playButtonTemplate);
    $(this).html(playerBarPlayButton);
    currentSoundFile.pause();   
  }
};

var getSongNumberCell = function(number) {
  return $('.song-item-number[data-song-number="' + number + '"]');
};

var trackIndex = function(album, song) {
     return album.songs.indexOf(song);
 };

var nextSong = function(){
  var songIndex = trackIndex(currentAlbum,currentSongFromAlbum);
  
  //function to get the previous song number (used in defining the last song number cell)//
  var getLastSongNumber = function(i){
    return i == 0 ? currentAlbum.songs.length : i;
  };
  
  songIndex++;
  
  //if the index of the current song is greater than or eq. to the number of songs in the album (array), we set the index back to 0 (first song)//
  if (songIndex >= currentAlbum.songs.length){
    songIndex = 0;
  }
  
  setSong(songIndex + 1);
  currentSoundFile.play(); 
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
    
  
  var lastSongNumber = getLastSongNumber(songIndex);
  var $nextSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = $('.song-item-number[data-song-number="' + lastSongNumber + '"]');
    
  $nextSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);
  
};

var previousSong = function(){
  var songIndex = trackIndex(currentAlbum,currentSongFromAlbum);
  
  var getLastSongNumber = function(i){
    return i == (currentAlbum.songs.length - 1) ? 1 : i + 2;
  }
  
  songIndex--;
  
  // if the index of the current song is less than 0, we set the current song index to the length of the album array minus 1//
  if (songIndex < 0){
    songIndex = currentAlbum.songs.length - 1;
  }
  
  setSong(songIndex + 1);
  currentSoundFile.play();
  updateSeekBarWhileSongPlays();
  updatePlayerBarSong();
    
  var lastSongNumber = getLastSongNumber(songIndex);
  var $previousSongNumberCell = getSongNumberCell(currentlyPlayingSongNumber);
  var $lastSongNumberCell = getSongNumberCell(lastSongNumber);
    
  $previousSongNumberCell.html(pauseButtonTemplate);
  $lastSongNumberCell.html(lastSongNumber);

};

var updatePlayerBarSong = function() {
  $('.currently-playing .song-name').text(currentSongFromAlbum.name);
  $('.currently-playing .artist-name').text(currentAlbum.artist);
  $('.currently-playing .artist-song-mobile').text(currentSongFromAlbum.name + " - " + currentAlbum.artist);
  
  $('.main-controls .play-pause').html(playerBarPauseButton);
  setTotalTimeInPlayerBar(filterTimeCode(currentSongFromAlbum.length));
};

var updateSeekPercentage = function($seekBar, seekBarFillRatio) {
  var offsetXPercent = seekBarFillRatio * 100;
  
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
   var $seekBars = $('.player-bar .seek-bar');

   $seekBars.click(function(event) {
     var offsetX = event.pageX - $(this).offset().left;
     var barWidth = $(this).width();
     var seekBarFillRatio = offsetX / barWidth;
     
     if ($(this).parent().attr('class') == 'seek-control') {
       // if it is determined you are using the seek control, use the seek function to setTime 
       // to the specified percentage of the song's duration
       seek(seekBarFillRatio * currentSoundFile.getDuration());
     } 
      // if not, you are using the volume control - set the volume 
     else {
       setVolume(seekBarFillRatio * 100);   
     }
     
     updateSeekPercentage($(this), seekBarFillRatio);
     
   });
  
  //here, we add an event listener, first declaring the seekBar variable (the parent) when 
  // the mouse is pressed down, then 
  $seekBars.find('.thumb').mousedown(function(event) {
    var $seekBar = $(this).parent();
  
    // binding to the entire document here so we can move the mouse away from the seekbar while holding it down and retain control
    $(document).bind('mousemove.thumb', function(event){
      var offsetX = event.pageX - $seekBar.offset().left;
      var barWidth = $seekBar.width();
      var seekBarFillRatio = offsetX / barWidth;
      
      if ($seekBar.parent().attr('class') == 'seek-control') {
        seek(seekBarFillRatio * currentSoundFile.getDuration());   
      } 
      else {
        setVolume(seekBarFillRatio);
      }
      
      updateSeekPercentage($seekBar, seekBarFillRatio);
    });
    
    // When we let go of the mouse, the event listener is unbound from the .thumb. If not, the bar would keep moving even after letting go of the mouse
    $(document).bind('mouseup.thumb', function() {
      $(document).unbind('mousemove.thumb');
      $(document).unbind('mouseup.thumb');
    });
  });
};

var setTotalTimeInPlayerBar = function(totalTime){
  var $totalTimeDiv = $('.seek-control .total-time');
  $totalTimeDiv.text(totalTime);
}

var filterTimeCode = function(timeInSeconds){
  var roundedSeconds = Math.floor(Number.parseFloat(timeInSeconds));
  var minutes = Math.floor(roundedSeconds / 60);
  var remainingSeconds = (roundedSeconds % 60);
  
  if (remainingSeconds < 10){
    remainingSeconds = '0' + remainingSeconds;
  }
  var displayedTime = minutes + ':' + remainingSeconds;
  
  return displayedTime; 
};

var updateSeekBarWhileSongPlays = function(){
  if (currentSoundFile){
    currentSoundFile.bind('timeupdate', function(event){
      var currentTime = currentSoundFile.getTime();
      var duration = currentSoundFile.getDuration();
      var seekBarFillRatio = this.getTime() / this.getDuration();
      var $seekBar = $('.seek-control .seek-bar');
      
      updateSeekPercentage($seekBar, seekBarFillRatio);
      setCurrentTimeInPlayerBar(filterTimeCode(currentTime));
    })
  }
};

var setCurrentTimeInPlayerBar = function(currentTime){
  var $currentTimeDiv = $('.seek-control .current-time');
  $currentTimeDiv.text(currentTime);
};

var seek = function(time) {
  if (currentSoundFile) {
    currentSoundFile.setTime(time);
  }
};
