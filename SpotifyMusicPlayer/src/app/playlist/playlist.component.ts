﻿import { Component, OnInit } from '@angular/core';
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

    ngOnInit(): void {
        this.waveSurfer = Object.create(WaveSurfer);
        this.waveSurfer.init({
            container: document.querySelector('#wave'),
            cursorColor: '#aaa',
            cursorWidth: 1,
            height: 80,
            waveColor: '#588efb',
            progressColor: '#f043a4'
        });
        this.playlistService.getPlaylist().then((tracks) => {
            this.playlist = tracks;
        });
    }
    
    hasPreview(track: Track): boolean {
        return track.preview !== null;
    }
}
