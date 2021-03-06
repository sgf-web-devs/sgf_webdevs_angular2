﻿import { Component, OnInit, Input } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';

import { PlaylistService } from "../services/playlist.service";
import { Track } from "./track";

declare var WaveSurfer: any; 

@Component({
    moduleId: module.id,
    selector: 'playlist-component',
    templateUrl: 'playlist.component.html'
})
export class PlaylistComponent implements OnInit {
    constructor(private router: Router, private activatedRoute: ActivatedRoute, private playlistService: PlaylistService) { }

    playlist: Track[];
    waveSurfer: any;
    playlistVisible = false;
    currentTrack: Track;
    currentTime: Date = new Date(0,0,0,0,0,0,0);
    totalTime: Date = new Date(0,0,0,0,0,0,0);
    @Input() searchTerm: string;

    ngOnInit(): void {
        this.waveSurfer = Object.create(WaveSurfer);
        this.waveSurfer.init({
            container: document.querySelector('#wave'),
            cursorColor: '#aaa',
            cursorWidth: 1,
            height: 80,
            waveColor: '#588efb',
            progressColor: '#f043a4',
            backend: 'MediaElement'
        });
        this.playlistService.getPlaylist().then((tracks) => {
            this.playlist = tracks;
            this.loadTrack(tracks[0]);
        });
    }

    getTracks(): Track[] {
        if (!this.playlist) return [];
        if (!this.searchTerm || this.searchTerm.length === 0) return this.playlist;

        return this.playlist.filter(track => track.hasInfoMatching(this.searchTerm));
    }
    
    hasPreview(track: Track): boolean {
        return track.preview !== null;
    }

    private convertToDate(seconds: number) : Date {
        let newTime = new Date(0, 0, 0, 0, 0, 0, 0);
        newTime.setSeconds(seconds || 0);
        return newTime;
    }

    loadTrack(track: Track): boolean {
        this.currentTrack = track;
        if (!this.hasPreview(track)) {
            this.waveSurfer.empty();
            return false;
        }
        this.playlistVisible = false;
        this.waveSurfer.un('ready');
        this.waveSurfer.un('audioprocess');
        this.waveSurfer.on('ready', () => {
            this.totalTime = this.convertToDate(this.waveSurfer.getDuration());
        });
        this.waveSurfer.on('audioprocess', () => {
            this.currentTime = this.convertToDate(this.waveSurfer.getCurrentTime());
            this.totalTime = this.convertToDate(this.waveSurfer.getDuration());
        });
        this.waveSurfer.load(track.preview);
        return true;
    }

    loadAndPlayTrack(track: Track): void {
        if(this.loadTrack(track)) {
            this.playTrack();            
        }
    }

    private wrapMoveTrack(delta: number): Track {
        let curTrackIdx = this.playlist.indexOf(this.currentTrack);
        if (curTrackIdx + delta < 0) curTrackIdx += this.playlist.length;
        let nextTrackIdx = (curTrackIdx + delta) % this.playlist.length;
        return this.playlist[nextTrackIdx];
    }

    prevTrack(): void {
        this.waveSurfer.stop();
        this.loadAndPlayTrack(this.wrapMoveTrack(-1));
    }

    nextTrack(): void {
        this.waveSurfer.stop();
        this.loadAndPlayTrack(this.wrapMoveTrack(1));
    }

    playTrack(): void {
        this.waveSurfer.play();
    }

    pauseTrack(): void {
        this.waveSurfer.pause();
    }

    stopTrack(): void {
        this.waveSurfer.stop();
    }

    togglePlaylist(): void {
        this.playlistVisible = !this.playlistVisible;
    }

    isPlaying(track: Track): boolean {
        return this.currentTrack === track;
    }
}
