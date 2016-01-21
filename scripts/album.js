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

$(document).ready(function() {
  setCurrentAlbum(albumPicasso); 
  $previousButton.click(previousSong);
  $nextButton.click(nextSong);
});

//functions defined below//

var createSongRow = function (songNumber, songName, songLength) {
  var template =
       '<tr class="album-view-song-item">'
   + '  <td class="song-item-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
   + '  <td class="song-item-title">' + songName + '</td>'
   + '  <td class="song-item-duration">' + songLength + '</td>'
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
  
  setSong(currentSongIndex + 1);
  currentSoundFile.play(); 
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
  
  setSong(currentSongIndex + 1);
  currentSoundFile.play(); 
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
};